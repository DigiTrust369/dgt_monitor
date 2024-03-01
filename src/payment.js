require('module-alias/register');
const { logger } = require('@config/logger');
const redis = require('@config/redis');
const { initKafka } = require('@config/kafka');
const { process } = require('@services/payment.service');
const {
  env,
  kafkaTopicCfg,
  kafkaCfg,
} = require('@config/vars');

(async () => {
  try {
    // set global variables for all module can use;
    global.redis = redis;
    global.logger = logger;
    logger.info('Establishing connection to kafka broker and processing payments.');
    // await initKafka();
    // subscribe help us create the topic if not existed
    const consumer = global.kafka.client.consumer({
      groupId: kafkaCfg.groupId,
      heartbeatInterval: kafkaCfg.heartbeatInterval,
      sessionTimeout: kafkaCfg.sessionTimeout,
    });

    await consumer.connect();
    await consumer.subscribe({ topic: kafkaTopicCfg.paymentTopic, fromBeginning: false });
    logger.info(`Subscribed topic: ${kafkaTopicCfg.paymentTopic}`);
    consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (env === 'development') logger.info(`Topic: ${topic}, offset: ${message.offset}, partition: ${partition}, key: ${message.key}, value: ${message.value}`);
          const data = JSON.parse(message.value);
          const isProcessed = await global.redis.get(`${data.id}.${message.offset}`);
          if (isProcessed) return logger.error(`Payment ${data.id} already processed, offset: ${message.offset}`);
          // cache the payment id and offset to not to process same message twice
          await redis.set(`${data.id}.${message.offset}`, message.offset);
          if (topic === kafkaTopicCfg.paymentTopic) await process(message.key, data);
        } catch (e) {
          logger.error(`Failed to process message offset: ${message.offset}, key: ${message.key}, value: ${message.value}, error: ${e.message ? e.message : e}`);
        }

        return true;
      },
    });
  } catch (err) {
    return logger.error(`Worker Job return error: ${err.message}`);
  }

  return true;
})();
