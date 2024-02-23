require('module-alias/register');
const constants = require('@config/constants');
const { logger } = require('@config/logger');
const { kafkaTopicCfg } = require('@config/vars');

class Transaction {
  constructor(api, config) {
    this.api = api;
    this.config = config;
    // store last message sent for each address
    // if two transactions send from same address, the delay function will be called
    this.lastTrxSent = 0;
  }

  /** delay n seconds for each transaction send from an address if the network is not supportted
  **/
  async delay (transaction) {
    if (!transaction.delay || transaction.delay <= 0) return;
    if (Date.now() >= this.lastTrxSent + transaction.delay) return;
    return new Promise((resolve, reject) => {
      logger.debug(`Delaying ${transaction.delay} miliseconds before send from ${transaction.address}`)
      setTimeout(() => {
        return resolve();
      }, transaction.delay);
    });
  }

  /** Get the private key for wallet address at hdpath
    * @params wallets: [{
    *   address   : 'xxxxxx',
    *   path      : 'm/44/0/1'
    * }]
    * @outputs private key array in hex
  **/
  getPrivateKeys (wallets) {
    // for backward compatible with withdrawal's prepare.
    // withdrawal's prepare do not include wallets property
    if (!wallets) return [this.config.withdrawalPriv];

    // ethereum wallet is an object
    if (!Array.isArray(wallets) && wallets.address) return [this.getPrivateKey(wallets.path)];

    // generate private from root key to this wallet's paths;
    let privates = [];
    for (let wallet of wallets ) {
      if (wallet.address === this.config.withdrawalAddr) {
        privates.push(this.config.withdrawalPriv);
        continue;
      }

      privates.push(this.getPrivateKey(wallet.path));
    }

    return privates;
  }

  /** Send transactions to the network
    * @params raw: {
    *   id         : 4,
    *   raw        : '00000000',
    *   txId       : 'aaaaaaaa'
    * }
    * @outputs status of raw transaction on the network.
  **/
  async send (transaction) {
    await this.delay(transaction);
    this.lastTrxSent = Date.now();
    logger.info(`Sending ${this.config.name} transaction ${transaction.txId}`);
    let response = await this.api.sendRawTransaction(transaction.tx);
    logger.info(`Send ${this.config.name} transaction ${transaction.txId} success`);
    return {
      txId: response.txId || transaction.txId,
      additionFee: response.additionFee || 0 // only tezos, a fee will be charged during transaction execute on network
    };
  }
}

module.exports = Transaction;
