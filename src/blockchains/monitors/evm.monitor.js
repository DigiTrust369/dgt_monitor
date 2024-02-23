const BigNumber = require('bignumber.js');
const EVMApi = require('@blockchains/apis/binance.api');
const Monitor = require('@blockchains/monitors/monitor');
const { evmCfg } = require('@config/vars');
const { logger } = require('@config/logger');
const constants = require('@config/constants');
const redis = require('@config/redis');

class EVMMonitor extends Monitor {
  constructor(api, config) {
    api = api || new EVMApi();
    config = config || evmCfg;
    super(api, config);
  }

  /** return this network name, we need it to set the right apis['network']
   * refer /src/blockchains/index.js for more details
  **/
  static get network () {
    return evmCfg.name;
  }

  /** Parse erc20 transfer input to address and amount
    * @params input: 0xa9059cbb000000000000000000000000cb2ef2e9923c4a4561df74ee581be7ec5e0f9279000000000000000000000000000000000000000000000e99aa58216f8dfe1000
   **/
  parseErc20TxInput (input) {
    return {
      to    : '0x' + input.slice(-constants.ETH_ERC20_AMOUNT_SIZE - constants.ETH_ERC20_ADDR_SIZE, -constants.ETH_ERC20_AMOUNT_SIZE),
      amount: '0x' + input.slice(-constants.ETH_ERC20_AMOUNT_SIZE)
    };
  }

  /** Check if transaction's to address or id is created/sent by us
    * @params data: [{
    *     txid        : '22e79be04f1de45903f10deb4bf8ed2888f1080313624553c6ee292e7ca011fe',
    *     to          : '38LGuH2m1KGhBarfqcjFKMFVoULPEeRN8c'
    * }]
   **/
  async filterTransactions (transactions) {
    if (!transactions || transactions.length <= 0) return [];

    // if one of (to or txid) is/are falsy value,
    // then it's not valid transaction for deposit or withdrawal or merge fund.
    transactions = transactions.filter(tx => tx.to && tx.txid);
    let addresses = transactions.map(tx => tx.to);
    let txHashes = transactions.map(tx => tx.txid);
    let keys = addresses.concat(txHashes);
    let cached = await redis.hmget(this.config.name, keys);
    let results = transactions.filter(tx => {
      return (cached[keys.indexOf(tx.to)] != null || cached[keys.indexOf(tx.txid)] != null);
    });

    return results;
  }

  /** Convert block to transactions list
    * @params block.transactions: [
    *     {
    *        "blockHash": "0x48d43b86f72b213410a417471284cb48d550b307572e510578ac8af84fd5f6ec",
    *        "blockNumber": "0x91bf6b",
    *        "from": "0x66396b3c3d8446e364e805cb0e8c310dddff685e",
    *        "gas": "0x15f90",
    *        "gasPrice": "0xa7a358200",
    *        "hash": "0xbd3c9690c1a461775742bc82ad4d5de772c704fed93dc47949788230a7e68cf2",
    *        "input": "0x",
    *        "nonce": "0x23a8",
    *        "to": "0xa748da89138315da4ce756910dd451974b368851",
    *        "transactionIndex": "0xd",
    *        "value": "0x57d15be733fc400",
    *        "v": "0x25",
    *        "r": "0x3abf6df743addc62adbcb329a2b6e147eed3fcccd0a1c82a0df093c248122a39",
    *        "s": "0x20e9c120ff683e7c6db68080b4eb76f726b18ae9ae53e27099ea7ec985f2b3c0"
    *    }]
    *
  **/
  async blockToTrxs (block) {
    let transactions = [];
    block.transactions.forEach((tx, i) => {
      // filter only BNB transfer or ERC20 token transfer
      let transaction = {
        txid          : tx.hash,
        height        : Number(tx.blockNumber),
        confirmed     : block.isConfirmed,
        from          : tx.from,
        gasPrice      : tx.gasPrice
      };

      // native eth transfer, convert wei to eth before send
      let value = new BigNumber(tx.value);
      if (value.isPositive() && tx.input === '0x') {
        transaction.to = tx.to;
        transaction.amount = value.dividedBy(1e18).toString();
        return transactions.push(transaction);
      }

      // ERC20 token transfer
      if (tx.input.indexOf(constants.ETH_ERC20_METHOD) === 0) {
        transaction.contract = tx.to;
        let erc20 = this.parseErc20TxInput(tx.input);
        transaction.to = erc20.to;
        // do not convert because we don't know how much decimals is it.
        // just check if value > 0 then set the origin hex value.
        let erc20Value = new BigNumber(erc20.amount);
        if (erc20Value.isPositive()) {
          transaction.amount = erc20Value.toFixed().toString();
          return transactions.push(transaction);
        }
      }
    });

    // filter transactions make by us before request to RPC.
    // Need to do this to reduce the number of call requests to RPC.
    let results = await this.filterTransactions(transactions);
    // get transaction's receipt to check if this transaction is executed successful or not
    for (let i = 0; i < results.length; i += 1) {
      let receipt = await this.api.getTransactionReceipt(results[i].txid);
      logger.debug(`[${this.config.name}] - Address ${results[i].to} Transaction ${results[i].txid} receipt status ${receipt.status}.`)
      if (receipt.status != '0x1') {
        results[i].status = constants.TRANSACTION_STATUS.FAILED;
        continue;
      }

      results[i].status = constants.TRANSACTION_STATUS.SUCCESS;
      results[i].fee = (new BigNumber(this.api.toCurrency(receipt.gasUsed, 18)).multipliedBy(results[i].gasPrice)).toString();
    }

    return results;
  }

  /** Convert transaction to deposit list
   *  @params transactions: [{
   *     txid          : '0x51a75892b554a1048e1361100edae60dc3da03a69b64e9190f184eb0aafab2f3',
   *     height        : 4497593,
   *     confirmed     : true,
   *     from          : '0x13c8995ea9b3c2f8cba9739b9cd91160861bf226',
   *     to            : '0x4b5eb9a1ea2923093799054bd2785e3211bf2648',
   *     amount        : '0xde0b6b3a7640000',
   *     fee           : '0x12'
   * }]
  **/
  trxsToDeposits (transactions) {
    let deposits = [];
    transactions.forEach((tx, i) => {
      if (tx.status != constants.TRANSACTION_STATUS.SUCCESS) return;
      let deposit = {
        network     : this.config.name,
        currency    : tx.contract ? '' : this.config.currency || 'BNB',
        contract    : tx.contract ? tx.contract : '',
        tx_hash     : tx.txid,
        amount      : tx.amount,
        block       : tx.height,
        address     : tx.to,
        confirmed   : tx.confirmed,
        tag         : ''
      };

      deposits.push(deposit);
    });

    return deposits;
  }

  /** Convert transaction to withdrawals list
    *  @params transactions: [{
    *     txid          : '0x51a75892b554a1048e1361100edae60dc3da03a69b64e9190f184eb0aafab2f3',
    *     height        : 4497593,
    *     confirmed     : true,
    *     from          : '0x13c8995ea9b3c2f8cba9739b9cd91160861bf226',
    *     to            : '0x4b5eb9a1ea2923093799054bd2785e3211bf2648',
    *     amount        : '0xde0b6b3a7640000',
    *     fee           : '0x12'
    * }]
  **/
  trxsToWithdrawals (transactions) {
    let withdrawals = [];
    transactions.forEach((tx, i) => {
      let withdrawal = {
        network       : this.config.name,
        currency      : tx.contract ? '' : 'BNB',
        contract      : tx.contract ? tx.contract : '',
        tx_hash       : tx.txid,
        block         : tx.height,
        confirmed     : tx.confirmed,
        from          : tx.from,
        to            : tx.to,
        amount        : tx.amount,
        fee           : tx.fee,
        status        : tx.status
      };

      withdrawals.push(withdrawal);
    });

    return withdrawals;
  }
}

module.exports = EVMMonitor;
