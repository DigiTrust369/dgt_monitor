require('module-alias/register');
const BigNumber = require('bignumber.js');
const EVMApi = require('@blockchains/apis/evm.api');
const constants = require('@config/constants');
const { evmCfg } = require('@config/vars');
const { logger } = require('@config/logger');

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
    return withdrawals;
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
    return sources
  }
}

module.exports = EVMFund;
