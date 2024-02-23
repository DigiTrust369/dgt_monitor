require('module-alias/register');
const BigNumber = require('bignumber.js');
const EVMApi = require('@blockchains/apis/evm.api');
const constants = require('@config/constants');
const { evmCfg } = require('@config/vars');
const { logger } = require('@config/logger');
const { getWalletObjects, getWhiteLabelWallet } = require('@utils/wallet');

class EVMFund {
   //using eth constant since similar EVM chain
  constructor(api, config) {
    this.api = api || new EVMApi();
    this.config = config || evmCfg;
    this.fees = this.config.fees;
  }

  /** return this network name, we need it to set the right apis['network']
   * refer /src/blockchains/index.js for more details
  **/
  static get network () {
    return evmCfg.name;
  }

  async estimateGasLimit (transfer) {
    return transfer.contract ? this.fees.maxBep20GasLimit : this.fees.maxGasLimit;
  }

  async getAccount(address){
    let balance = await this.api.getBalance(address);
    let nonce = await this.api.getNonce(address);
    return {
      nonce     : parseInt(nonce, 16),
      balances  : {
        binance: new BigNumber(balance),
      }
    };
  }

  buildTransferData (transfer) {
    if (!transfer.contract) return '0x';
    return constants.ETH_ERC20_METHOD + transfer.address.toLowerCase().slice(2).padStart(64, '0') + this.api.toUnit(transfer.amount, transfer.decimal).toString(16).padStart(64, '0');
  }

  balanceCheck (account, withdrawals) {
    let amounts = {}, txFees = new BigNumber(0);
    withdrawals.forEach((withdrawal) => {
      let contract = withdrawal.contract || 'binance';
      let fee = new BigNumber(this.fees.gasPrice * withdrawal.gasLimit);
      // every transaction cost a fee
      txFees = txFees.plus(fee);
      amounts[contract] = amounts[contract] ? amounts[contract].plus(withdrawal.value) : withdrawal.value;
    });


    // check erc20, bnb balance without fee
    Object.keys(amounts).forEach((contract) => {
      if (!account.balances[contract].isPositive() || account.balances[contract].isLessThan(amounts[contract])) {
        throw new Error(`[${this.config.name}] - Not enough bnb/erc20 balance to withdrawal: have ${account.balances[contract].toFixed()}, need: ${amounts[contract].toFixed()}`);
      }
    });

    // check fee, with or without binance transfer.
    let need = amounts['binance'] ? amounts['binance'].plus(txFees) : txFees;
    if (!account.balances.binance.isPositive() || account.balances.binance.isLessThan(need)) {
      throw new Error(`[${this.config.name}] - Not enough bnb to pay for fee and/or transfer: have ${account.balances.binance.toFixed()}, need: ${need.toFixed()}`);
    }
  }

  /** Prepare data for withdrawal transaction
   * @params account: {
   *    nonce     : '0x1f',
   *    balances  : {
   *      binance: BigNumber Object,
   *    }
   *  }
   * @params withdrawals: [{
   *      id          : 4,
   *      currency    : "BTC",
   *      status      : "approved",
   *      user_id     : 1,
   *      amount      : "0.999",
   *      address     : "2N5S3XxGQ3jvduFmK5hP2mpGHhnLHAKAwxQ",
   *  }]
   * @outputs: Array of EVMTx inputs format
  **/
  prepare (account, withdrawals) {
    let targets = withdrawals.filter(withdrawal => {
      let amount = this.api.toUnit(withdrawal.amount, withdrawal.decimal);
      if (amount.isPositive() && amount.isGreaterThan(0)) return true;

      throw new Error(`[${this.config.name}] - Prepare id ${withdrawal.id} error: invalid target's amount: ${amount}`);
    }).map(o => {
      return {
        id        : o.id,
        from      : o.from,
        address   : o.address,
        amount    : o.amount,
        value     : this.api.toUnit(o.amount, o.decimal),
        contract  : o.contract,
        decimal   : o.decimal,
        currency  : o.currency,
        gasLimit  : o.gasLimit,
        type      : o.type
      }
    });

    this.balanceCheck(account, targets);
    let transfers = [];
    targets.forEach((target, index) => {
      let transactionFee = new BigNumber(this.fees.gasPrice).multipliedBy(target.gasLimit);
      transfers.push({
        id        : target.id,
        data      : this.buildTransferData(target),
        gasPrice  : '0x' + this.fees.gasPrice.toString(16),
        gasLimit  : '0x' + target.gasLimit.toString(16),
        from      : target.from,
        to        : target.contract || target.address,
        value     : target.contract ? '0x0' : '0x' + target.value.toString(16),
        nonce     : '0x' + (account.nonce + index).toString(16),
        decimal   : target.decimal,
        amount    : target.amount,
        fee       : this.api.toCurrency(transactionFee.toFixed(), 18),  // this is estimate fee, real fee is only know after executed by blockchain
        type      : target.type
      });

      // TODO: cached the nonce to redis, next prepare must be sure all the old transactions
      // has been confirmed or else all the new prepare will return invalid/dupplicate nonce
    });

    return transfers;
  }

  /** Prepare data for withdrawal transaction, support EVM tokens
    * EVM withdrawals must set the contract and decimal, EVM - contract must be null
    * @params data: [{
    *     "id": 17,
    *     "currency": "BNB",
    *     "contract": null,
    *     "decimal": 18,
    *     "status": "approved",
    *     "amount": "0.99",
    *     "address": "0x2d000c3ddea6bb3b695af6aa116265a33299a1f5",
    *   }]
  **/
  async withdrawal (withdrawals) {
    if (!withdrawals || typeof withdrawals != 'object' || withdrawals.length <= 0) {
      logger.warn(`[${this.config.name}] - invalid withdrawal params ${withdrawals}.`);
      return [];
    };

    let whiteLabelAddress = ""
    let account = await this.getAccount(this.config.withdrawalAddr)

    // get all the contract balances
    for (let withdrawal of withdrawals) {
      let isWhiteLabel = withdrawal.whitelabel_name && withdrawal.whitelabel_name.length > 0 ? true : false
      let haveWithdrawAddress = withdrawal.whitelable_withdraw_address && withdrawal.whitelable_withdraw_address.length > 0 ? true : false

      withdrawal.from = this.config.withdrawalAddr;
      if(isWhiteLabel && haveWithdrawAddress){
        withdrawal.from = withdrawal.whitelable_withdraw_address
        whiteLabelAddress = withdrawal.whitelable_withdraw_address
        
        account = await this.getAccount(whiteLabelAddress)
      }
    
      withdrawal.gasLimit = await this.estimateGasLimit(withdrawal);
      if (!withdrawal.contract || withdrawal.contract.length <= 0 || account.balances[withdrawal.contract]) continue;

      let erc20Balance = await this.api.getErc20Balance(withdrawal.contract, this.config.withdrawalAddr);
      account.balances[withdrawal.contract] = new BigNumber(erc20Balance);
    }

    let prepares =  this.prepare(account, withdrawals)
    if(whiteLabelAddress.length > 0){
      let privKey = await getWhiteLabelWallet(whiteLabelAddress)
      prepares.forEach((p) => {
        p.privKey  = privKey     
      }); 
    }

    return prepares;
  }


  /** Prepare data for centralize transaction, support BNB and ERC20 tokens
    * ERC20 centralize must set the contract and decimal, BNB - contract must be null
    * @params data: [{
    *     "id": 17,
    *     "currency": "BNB",
    *     "contract": null,
    *     "decimal": 18,
    *     "amount": "0.99",
    *     "address": "0x2d000c3ddea6bb3b695af6aa116265a33299a1f5",
    *   }]
  **/
  async centralize (sources) {
    if (!sources || !Array.isArray(sources) || sources.length <= 0) {
      logger.warn(`[${this.config.name}] - invalid centralize params ${sources}.`);
      return [];
    };

    // always centralize tokens first, or else we will be cost more gas fee
    sources.sort(function (a, b) {
      return b.contract - a.contract;
    })

    // get wallet's info of source's address;
    let addresses = sources.map(source => source.address);
    let wallets = await getWalletObjects(this.config.name, addresses);
    let withdrawals = [];
    let prepares = [];
    let accounts = {};
    // get balance and nonce infos, then group sources by address
    for (let source of sources) {
      if (!accounts[source.address]) {
        accounts[source.address] = { fees: new BigNumber(0), balances: {}, sources: [] };
      }

      if (!accounts[source.address].nonce) {
        let balance = await this.api.getBalance(source.address);
        let nonce = await this.api.getNonce(source.address);
        accounts[source.address].nonce = parseInt(nonce, 16);
        accounts[source.address].balances.binance = new BigNumber(balance);
      }

      if (source.contract && !accounts[source.address].balances[source.contract]) {
        let erc20Balance = await this.api.getErc20Balance(source.contract, source.address);
        accounts[source.address].balances[source.contract] = new BigNumber(erc20Balance);
      }

      if ((!source.centralized_address || source.centralized_address.length <= 0) && !this.config.centralizeAddr) {
        throw new Error(`Invalid centralized to address: ${source.centralized_address}, centralization from ${source.address}.`);
      }

      source.from = source.address;
      source.address = source.centralized_address || this.config.centralizeAddr;
      source.gasLimit = await this.estimateGasLimit(source);
      accounts[source.from].sources.push(source);
    }

    for (let address in accounts) {
      let balances = accounts[address].balances;
      let targets = accounts[address].sources;
      for (let target of targets) {
        // this is token centralize, need check token balance
        let transactionFee = new BigNumber(this.fees.gasPrice).multipliedBy(target.gasLimit);
        if (target.contract && target.contract.length > 0) {
          // transfer all token balance to centralizeAddr
          target.amount = this.api.toCurrency(balances[target.contract].toString(), target.decimal);
          // if this address do not have enough binance to pay for centralize fee, withdrawal some native token to it

          if (balances.binance.isLessThanOrEqualTo(transactionFee)) {

            let withdrawal = {...target};
            withdrawal.address = target.from;
            withdrawal.currency = 'BNB';
            withdrawal.contract = '';
            withdrawal.decimal = 18;
            let needAmount = transactionFee.minus(balances.binance);
            withdrawal.amount = this.api.toCurrency(needAmount.toFixed().toString(), withdrawal.decimal);
            withdrawal.gasLimit = await this.estimateGasLimit(withdrawal);
            withdrawal.type   = constants.TRANSACTION_TYPE.CENTRALIZE_FEE;
            // update account's balance or else balanceCheck will fail.
            balances.binance = balances.binance.plus(transactionFee);
            withdrawals.push(withdrawal);
          }

          // sum fee of all contract transactions, if we also centralize native token, we need to minus this fee
          accounts[address].fees = accounts[address].fees.plus(transactionFee);
        } else {
          // amount = balance - contract's transaction fee - this centralize gas fee
          target.amount = this.api.toCurrency(balances.binance.minus(accounts[address].fees).minus(transactionFee).toString(), 18);
        }
      }

      let centralize = this.prepare(accounts[address], targets);
      centralize.forEach((c) => c.wallet = wallets[address]);
      prepares = prepares.concat(centralize);
    }

    if (withdrawals.length > 0) {
      let fundings = await this.withdrawal(withdrawals);
      prepares = fundings.concat(prepares);
    }

    return prepares;
  }
}

module.exports = EVMFund;
