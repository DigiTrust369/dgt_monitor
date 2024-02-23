const { kafkaTopicCfg, redisCfg } = require('@config/vars');
const { logger } =  require('@config/logger');
const { blockCache, overrideBlockInterval, monitorDelayInterval } = require('@config/vars');
const redis = require('@config/redis');
const { getTopicName } = require('@utils/kafka');

class Monitor {
  constructor(api, config) {
    this.api = api;
    this.config = config;
    this.lastReport = Date.now();
    this.lastBlockChecked = Date.now();
    this.startFromBlock = 0;
    // recheck redis every minute to get new start block number set by users.
    setInterval(() => {
      this.getStartFromBlock();
    }, overrideBlockInterval);
  }

  /** Send report data to monitor dashboard ui
   * @params: height
  **/
  async report (time, head, processed) {
    if (Date.now() - this.lastReport <= 2000 || redisCfg.isReportEnable != 'true') return;
    let msg = JSON.stringify({
      network   : this.config.name,
      head      : head,
      time      : time,
      processed : processed,
      node      : this.api.base.hostname
    });

    this.lastReport = Date.now();
    redis.client.publish(redisCfg.reportChannel, msg);
  }

  isConfirmed (height, current) {
    return height <= (current - this.config.minConfirmation);
  }

  isEmptyBlock (block) {
    return !Object.keys(block).length;
  }

  // check if our monitor node is delayed, then report to sentry;
  async monitorDelayEvent() {
    if (Date.now() - this.lastBlockChecked <= monitorDelayInterval) return;
    let highestBlock = await this.api.getHighestBlock();
    let head = await this.api.getBlockCount();
    if (highestBlock > head && (highestBlock - head) > this.config.maxDelayedBlock) {
      logger.error(`Fullnode network ${this.config.name} is delayed ${highestBlock - head} blocks.`);
    }

    this.lastBlockChecked = Date.now();
  }

  async getStartFromBlock () {
    let block = await redis.get(`${this.config.name}.start-process-block`);
    if (block && block > 0) this.startFromBlock = block;
  }

  async deleteStartFromBlock () {
    this.startFromBlock = 0;
    let block = await redis.del(`${this.config.name}.start-process-block`);
  }

  /** Set last processed block number for this coin name
   * @params: height
  **/
  async setProcessedBlock (height) {
    return await redis.set(`${this.config.name}.last-processed-block`, height);
  }

  /** Set last confirmed block number for this coin name
   * @params: height
  **/
  async setConfirmedBlock (height) {
    return await redis.set(`${this.config.name}.last-confirmed-block`, height);
  }

  /** get last confirmed block number for this coin name
   * @params: height
  **/
  async getConfirmedBlock (processed = 0) {
    let lastConfirmed = processed - this.config.minConfirmation;
    lastConfirmed = lastConfirmed > 0 ? lastConfirmed : 0;
    let confirmed = await redis.get(`${this.config.name}.last-confirmed-block`);
    return Number(confirmed) || Number(lastConfirmed);
  }

  /** Get last processed block number for this coin name
   * @return block number
  **/
  async getProcessedBlock () {
    let block = await redis.get(`${this.config.name}.last-processed-block`);
    return Number(block) || Number(this.config.firstLaunched);
  }

  async setBlock (height, block) {
    // not all blockchain support cached, example bitcoin because of soft fork.
    if (!blockCache.networks.includes(this.config.name)) return;
    return await redis.setExpire(`${this.config.name}.block.${height}`, JSON.stringify(block), blockCache.cacheTime);
  }

  async getBlock (height) {
    if (!blockCache.networks.includes(this.config.name)) return;
    let block = await redis.get(`${this.config.name}.block.${height}`);
    if (block) {
      logger.debug(`[${this.config.name}] - Block ${height} is loaded from redis cache`);
      return JSON.parse(block);
    }
  }

  async deleteBlock (height) {
    if (!blockCache.networks.includes(this.config.name)) return;
    return await redis.del(`${this.config.name}.block.${height}`);
  }

  /** Send deposits data to kafka
   * @params data: [{
   *     network     : 'bitcoin',
   *     currency    : 'BTC',
   *     contract    : '',
   *     tx_hash     : '22e79be04f1de45903f10deb4bf8ed2888f1080313624553c6ee292e7ca011fe',
   *     amount      : 10000000,
   *     block       : 1000,
   *     address     : '38LGuH2m1KGhBarfqcjFKMFVoULPEeRN8c',
   *     confirmed   : false
   * }]
  **/
  async publishDeposits (deposits) {
    if (!deposits || deposits.length <= 0) return;
    for (let data of deposits) {
      let msg = {
        topic     : getTopicName(data.topic_prefix, kafkaTopicCfg.deposit),
        key       : kafkaTopicCfg.deposit,
        message   : data,
      };

      delete msg.message.topic_prefix;
      await global.kafka.send(msg);
    }
  }

  /** Send transaction record data to kafka
   * @params: data: [{
   *     network       : 'bitcoin',
   *     currency      : 'BTC',
   *     contract      : '',
   *     tx_hash       : '22e79be04f1de45903f10deb4bf8ed2888f1080313624553c6ee292e7ca011fe',
   *     block         : 1000,
   *     confirmed     : true
   * }]
  **/
  async publishTransactions (transactions) {
    if (!transactions || transactions.length <= 0) return Promise.resolve();
    for (let data of transactions) {
      let msg = {
        topic     : getTopicName(data.topic_prefix, kafkaTopicCfg.transaction),
        key       : kafkaTopicCfg.transaction,
        message   : data,
      };

      delete msg.message.topic_prefix;
      await global.kafka.send(msg);
    }
  }

  /** Check if transaction's address is created by us
    * @params data: [{
    *     network     : 'bitcoin',
    *     currency    : 'BTC',
    *     contract    : '',
    *     tx_hash     : '22e79be04f1de45903f10deb4bf8ed2888f1080313624553c6ee292e7ca011fe',
    *     amount      : 10000000,
    *     block       : 1000,
    *     address     : '38LGuH2m1KGhBarfqcjFKMFVoULPEeRN8c',
    *     confirmed   : false,
    *     tag         : ''
    * }]
   **/
  async filterDeposits (data) {
    if (!data || data.length <= 0) return [];
    let addresses = data.map(e => {
      // this is ripple or eos, using tag, not address to deposit
      if (e.tag && e.tag.length > 0) {
        return e.address + '.' + e.tag;
      }

      return e.address;
    });

    // filter deposit our addresses
    let addrStored = await redis.hmget(this.config.name, addresses);
    let deposits = data.filter(e => {
      let address = e.address;
      if (e.tag && e.tag.length > 0) address += `.${e.tag}`;
      if (addrStored[addresses.indexOf(address)] === null) {
        return false;
      }

      logger.info(`[${this.config.name}] - ${e.address} deposit ${e.amount} coins at ${e.tx_hash}.`)
      return true;
    });

    // get topic prefix for each deposit address
    let topics = await redis.hmget(`${this.config.name}.topics`, addresses);
    deposits.forEach(deposit => {
      let address = deposit.address;
      if (deposit.tag && deposit.tag.length > 0) address += `.${deposit.tag}`;
      deposit.topic_prefix = topics[addresses.indexOf(address)];
    });

    return deposits;
  }

  /** Check if transaction's hash is sent by us
   * @params: data: [{
   *     network       : 'bitcoin',
   *     currency      : 'BTC',
   *     contract      : '',
   *     tx_hash       : '22e79be04f1de45903f10deb4bf8ed2888f1080313624553c6ee292e7ca011fe',
   *     block         : 1000,
   *     confirmed     : true
   * }]
  **/
  async filterWithdrawals (data) {
    if (!data || data.length <= 0) return [];
    let txHashes = data.map(e => e.tx_hash);
    let hashStored = await redis.hmget(this.config.name, txHashes);
    let withdrawals = data.filter(e => {
      if (hashStored[txHashes.indexOf(e.tx_hash)] === null) {
        return false;
      }

      logger.info(`[${this.config.name}] - withdrawal ${e.tx_hash} successful at block ${e.block}.`);
      e.topic_prefix = hashStored[txHashes.indexOf(e.tx_hash)];
      return true;
    });

    return withdrawals;
  }

  async getChainInfo() {
    let head = await this.api.getBlockCount();
    let processed = await this.getProcessedBlock();
    let lastConfirmed = await this.getConfirmedBlock(processed);
    let diff = head - processed;
    return { head, processed, lastConfirmed, diff };
  }

  async processBlock(block) {
    if (!block.transactions) return;
    let headTime = new Date().toLocaleString();
    block.isConfirmed = this.isConfirmed(block.height, block.head);
    let transactions = await this.blockToTrxs(block);
    logger.debug(`[${this.config.name}] - Block ${block.height} contain ${transactions.length} valid transactions`);
    let transaction = {
      deposits    : this.trxsToDeposits(transactions),
      withdrawals : this.trxsToWithdrawals(transactions)
    };

    let deposits = await this.filterDeposits(transaction.deposits);
    let withdrawals = await this.filterWithdrawals(transaction.withdrawals);
    await this.publishDeposits(deposits);
    await this.publishTransactions(withdrawals);
    await this.report(headTime, block.head, block.height);
  }

  /** Start monitor service **/
  async start () {
    this.monitorDelayEvent();
    if (this.isRunning) return;

    logger.debug(`Starting monitor service for ${this.config.name}`);
    this.isRunning = true;
    // await this.setProcessedBlock(9983007)
    let processingBlock = 0;
    try {
      if (this.startFromBlock) {
        logger.info(`Overwrite last processed block by user, new block: ${this.startFromBlock}`);
        await this.setConfirmedBlock(this.startFromBlock);
        await this.deleteStartFromBlock();
      }

      let chain = await this.getChainInfo();
      if (isNaN(chain.head) || isNaN(chain.processed) || chain.processed >= chain.head || chain.head <= 0) {
        this.isRunning = false;
        return;
      }

      // note: reprocessing unconfirmed -> confirmed block.
      logger.debug(`[${this.config.name}] - Processing blocks from ${chain.lastConfirmed} to ${chain.head}`);
      for (let i = chain.lastConfirmed; i <= chain.head; i++) {
        //  check if the processed block last row still unconfirmed, skip it.
        if (chain.diff < this.config.minConfirmation && i <= chain.processed && i > (chain.processed - (this.config.minConfirmation - chain.diff))) continue;
        let height = processingBlock = i;
        // try to get block info from cach first
        let block = await this.getBlock(height);
        if (!block) block = await this.api.getBlock(height);
        if (!block || this.isEmptyBlock(block)) throw new Error(`[${this.config.name}] - Block ${height} is invalid: ${JSON.stringify(block)}`);
        block.height = height;
        block.head = chain.head;
        await this.processBlock(block);
        await this.setProcessedBlock(block.height);
        logger.debug(`[${this.config.name}] - Processed blocks ${i}/${chain.head}, is confirmed (${block.isConfirmed})`);
        if (block.isConfirmed) await this.setConfirmedBlock(block.height);
        if (this.startFromBlock) break;
        if (block.isConfirmed && i != chain.lastConfirmed + 1) await this.deleteBlock(height);
        if (!block.isConfirmed) await this.setBlock(height, block);
      }
    } catch (e) {
      logger.error(`Monitor blockchain ${this.config.name} failed at block ${processingBlock}, reason: ${e.message}`);
    }

    this.isRunning = false;
  }
}

module.exports = Monitor;
