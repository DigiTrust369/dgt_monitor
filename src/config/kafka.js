const { Kafka, logLevel } = require('kafkajs');
const { env, kafkaCfg } = require('@config/vars');
const { logger } = require('@config/logger');
const winston = require('winston');
const toWinstonLogLevel = level => {
  switch(level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
        return 'error'
    case logLevel.WARN:
        return 'warn'
    case logLevel.INFO:
        return 'info'
    case logLevel.DEBUG:
        return 'debug'
  }
}

const WinstonLogCreator = logLevel => {
  const level = toWinstonLogLevel(logLevel);
  return ({ namespace, level, label, log }) => {
      const { message, ...extra } = log
      logger.log({
          level: toWinstonLogLevel(level),
          message,
          extra,
      })
  }
}

const settings = {
  clientId: kafkaCfg.clientId,
  brokers : kafkaCfg.urls.split(","),
  logLevel: logLevel.INFO,
  logCreator: WinstonLogCreator
};

const initKafka = async () => {
  const kafka = new Kafka(settings);
  const producer = kafka.producer();
  await producer.connect();
  global.kafka = {
    client: kafka,
    send: async (data) => {
      let payload = {
        topic: data.topic,
        messages: [{
          key: data.key,
          value: JSON.stringify(data.message)
        }],
      }

      await producer.send(payload);
    }
  }
};

module.exports = {
  settings      : settings,
  initKafka     : initKafka
};
