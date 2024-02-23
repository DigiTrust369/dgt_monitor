const BigNumber = require('bignumber.js');
const fetch = require('node-fetch');
const Api = require('@blockchains/apis/api');
const constants = require('@config/constants');
const { evmCfg, env } = require('@config/vars');

class EVMApi extends Api {
  constructor(config) {
    config = config || evmCfg;
    super(config);
  }

  /** Convert currency to unit amount
   * @params: amount: amount in bnb or token
   * @outputs: amount in unit as a BigNumber
  **/
  toUnit (amount, decimal) {
    let value = new BigNumber(amount);
    if (!value.isPositive()) throw Error(`[${this.config.name}] - Invalid bnb/token amount ${amount} to convert.`);
    return value.multipliedBy(10 ** decimal);
  }

  /** Convert unit to currency amount
   * @params: amount: amount in unit, convert by toUnit
   * @outputs: amount in currency as a string
  **/
  toCurrency (amount, decimal) {
    let value = new BigNumber(amount);
    if (!value.isPositive()) throw Error(`[${this.config.name}] - Invalid bnb/token amount ${amount} toCurrency.`);
    return value.dividedBy(10 ** decimal).toString();
  }

  gweiToWei (amount) {
    let value = new BigNumber(amount);
    if (!value.isPositive()) throw Error(`[${this.config.name}] - Invalid amount ${amount} to convert.`);
    return value.multipliedBy(10 ** 9);
  }

  async getBlockCount () {
    let block = await this.request("eth_blockNumber", []);
    return parseInt(block, 16);
  }

  async getBlock (height) {
    return await this.request("eth_getBlockByNumber", ['0x' + height.toString(16), true]);
  }

  async getTransactionCount (withdrawal_address) {
    return await this.request("eth_getTransactionCount", [withdrawal_address, 'pending']);
  }

  async getTransactionReceipt(txid) {
    return await this.request("eth_getTransactionReceipt", [txid]);
  }

  async getBalance (withdrawal_address) {
    return await this.request("eth_getBalance", [withdrawal_address, 'latest']);
  }

  async getErc20Balance (contract, withdrawal_address) {
    let data = constants.ETH_ERC20_BALANCE + withdrawal_address.slice(2).padStart(64, '0');
    return await this.request("eth_call", [{ to: contract, data: data }, 'latest']);
  }

  async getNonce (withdrawal_address) {
    return await this.request("eth_getTransactionCount", [withdrawal_address, 'latest']);
  }

  async sendRawTransaction (signed_hex) {
    return await this.request("eth_sendRawTransaction", [signed_hex]);
  }

  async getTransactionByHash (tx_id) {
    return await this.request("eth_getTransactionByHash", [tx_id]);
  }

  async ethCall (contract_address, data) {
    return await this.request("eth_call", [{ to: contract_address, data: data }, 'latest']);
  }

  async estimateGas (to, data) {
    if (this.config.network != 'mainnet' || env == 'test') {
      if (data != '0x') return this.config.fees.maxErc20GasLimit;
      if (data == '0x') return this.config.fees.maxEthGasLimit;
    }

    return await this.request("eth_estimateGas", [{ to: to, data: data }]);
  }

  async getGasTracker () {
    if (this.config.network != 'mainnet' || env == 'test') {
      return {
        SafeGasPrice    : "2",
        ProposeGasPrice : "3",
        FastGasPrice    : "4"
      }
    }

    const res = await fetch(this.config.gasTrackerApi + this.config.gasTrackerKey);
    if (res.ok) { // res.status >= 200 && res.status < 300
      let body = await res.json();
      if (body.status == "1" && body.message == "OK") return body.result;
    }

    throw new Error(`Get gas tracker data failed: status ${res.status}, message: ${res.statusText}`);
  }
}

module.exports = EVMApi;
