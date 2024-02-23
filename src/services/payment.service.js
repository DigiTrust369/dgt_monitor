const httpStatus = require('http-status');
const BigNumber = require('bignumber.js');
const Validator = require('multicoin-address-validator');
const APIError = require('@utils/api.error');
const { preparers, prepareFileName, kafkaTopicCfg } = require('@config/vars');
const constants = require('@config/constants');
const { reportPaymentStatus } = require('@utils/kafka');
const { funds } = require('@blockchains');
const { transactions } = require('@blockchains');
const { validate } = require('@services/address.service');
const { withdrawal: withdrawalSchema, centralize: centralizeSchema } = require('@validations/funds.validation');


/** save trx id to redis for monitor service
**/
const cacheTrxId = async (payment, transaction) => {
  if (transaction.status != constants.SEND_RAW_STATUS.SUCCESS || !global.redis ) return;
  return redis.hmset(payment.network, { [transaction.txId]: payment.topic_prefix || 'sent' });
}

/**
 * Processing withdrawal request from paygate
 * @output: refer public/files/*.json for more details
 */
const withdrawal = async (data) => {
  try {
    logger.info(`Processing ${data.network} withdrawal payment id: ${data.id}.`);
    const result = withdrawalSchema.validate(data);
    const addressValid = validate(data.network, data.address);
    if (result.error || !addressValid) {
      throw new Error(`Invalid withdrawal request, error: ${result.error}, address valid? ${addressValid}, value: ${data}`);
    }

    let raw = await funds[data.network].withdrawal([data]);
    let txs = await transactions[data.network].create(raw);
    // in withdrawal payment, only one raw transcation is return for each payment
    if (!txs || txs.length != 1) throw new Error(`Invalid payment raw transaction for withdrawal ${data.id}: ${txs}`);
    let transaction = txs[0];
    // set delay if last transaction too close;
    transaction.delay = (transactions[data.network].config.withdrawalDelay || 0) * 1000;
    let info = await transactions[data.network].send(transaction);
    transaction.txId = info.txId || transaction.txId;
    transaction.amount = transaction.amount; // real amount of the transaction will be reported via monitor service
    transaction.fee = new BigNumber(transaction.fee).plus(info.additionFee).toNumber(); // fee is not correct in some network
    transaction.status = constants.TRANSACTION_STATUS.SUCCESS;
    transaction.message = '';
    await reportPaymentStatus(constants.TRANSACTION_TYPE.WITHDRAWAL, data, transaction);
    await cacheTrxId(data, transaction);
    logger.info(`Processed ${data.network} payment id: ${data.id}.`);
  } catch (e) {
    logger.error(`Process payment id ${data.id} failed: ${e.message}`);
    await reportPaymentStatus(constants.TRANSACTION_TYPE.WITHDRAWAL, data, { status: constants.TRANSACTION_STATUS.FAILED, message: e.message });
  }
};


/**
 * Processing merge fund request from paygate
 * @output: refer public/files/*.json for more details
 */
const centralize = async (data) => {
  try {
    logger.info(`Processing ${data.network} centralize payment id: ${data.id}.`);
    const result = centralizeSchema.validate(data);
    let addressValid = validate(data.network, data.address);
    // check if the centralize id emptry string or null, if true then set to null to let the fund service using default centralize addresses
    data.centralized_address = data.centralized_address && data.centralized_address.length > 0 ? data.centralized_address : null;
    let centralizedAddressValid = data.centralized_address ? validate(data.network, data.centralized_address) : true;
    if (result.error || !addressValid || !centralizedAddressValid) {
      throw new Error(`Invalid withdrawal request, error: ${result.error}, address valid? ${!addressValid || !centralizedAddressValid}, value: ${data}`);
    }

    let raw = await funds[data.network].centralize([data]);
    let txs = await transactions[data.network].create(raw);
    let transaction = { status: constants.TRANSACTION_STATUS.SUCCESS, message: '' }; // for report
    // in cause centralize, more one transactions per payment (a transaction is used for network fee)
    for (let tx of txs) {
      // at the present, only tron and ethereum have to send TRX or ETH to the address to pay for fee.
      // this amount of TRX or ETH is considered as network fee.
      if (tx.type == constants.TRANSACTION_TYPE.CENTRALIZE_FEE) {
        transaction.fee = tx.amount;
      } else {
        // set delay if last transaction too close, only set for the merging transaction, fee transaction already delay after this;
        tx.delay = (transactions[data.network].config.centralizeDelay || 0) * 1000;
        transaction.txId = tx.txId;
        transaction.amount = tx.amount;
      }

      let result = await transactions[data.network].send(tx);
    }

    await reportPaymentStatus(constants.TRANSACTION_TYPE.CENTRALIZE, data, transaction);
    await cacheTrxId(data, transaction);
    logger.info(`Processed ${data.network} centralize payment id: ${data.id}.`);
  } catch (e) {
    logger.error(`Process ${data.network} centralize payment id ${data.id} failed: ${e}`);
    await reportPaymentStatus(constants.TRANSACTION_TYPE.CENTRALIZE, data, { status: constants.TRANSACTION_STATUS.FAILED, message: e.message });
  }
};

exports.process = async (type, data) => {
  if (type == 'withdrawal') return withdrawal(data);
  if (type == 'centralize') return centralize(data);
}
