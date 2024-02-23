const { env } = require('@config/vars');
const { kafkaTopicCfg, decimalCfg } = require('@config/vars');

const getTopicName = (prefix, name) => {
  // 'sent' is the transaction value in redis for old version of wallet
  prefix = prefix && prefix != 'sent' ? prefix : 'dgt-monitor';
  if (env != 'production') return `${prefix}-${name}-${env}`;
  return `${prefix}-${name}`;
};

const reportPaymentStatus = async (type, payment, transaction) => {
  if(transaction.amount){
    transaction.amount = transaction.amount.toFixed(decimalCfg)
  }
  let data = {
    topic     : getTopicName(payment.topic_prefix, kafkaTopicCfg.fund),
    key       : kafkaTopicCfg.fund,
    message   : {
      id      : payment.id,
      type    : type,
      status  : transaction.status,
      txId    : transaction.txId || '',
      amount  :  transaction.amount && transaction.amount.toString() || '0',
      fee     : transaction.fee && transaction.fee.toString() || '0',
      message : transaction.message,
      address : payment.address
    },
  };

  await global.kafka.send(data);
}

module.exports = {
  getTopicName : getTopicName,
  reportPaymentStatus: reportPaymentStatus
};
