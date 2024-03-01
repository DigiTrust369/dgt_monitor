require('module-alias/register');
const { logger } = require('@config/logger');
const { CronJob } = require('cron');
const { monitors } = require('@blockchains');
const { networks, cronTime } = require('@config/vars');
const redis = require('@config/redis');
const { initKafka } = require('@config/kafka');

(async () => {
  try {
    // set global variables for all module can use;
    global.redis = redis;
    global.logger = logger;

    logger.info('Establishing connection to kafka broker and run the monitor jobs.');
    // await initKafka();
    monitors['apt'].start();
    // const job = new CronJob({
    //   cronTime,
    //   onTick: () => {
    //     networks.forEach((network) => {
    //       console.log("Network :", network)
    //       monitors['apt'].start();
    //     });
    //   },
    //   start: true,
    // });

    // return job.start();
  } catch (err) {
    return logger.error(`Worker Job return error: ${err.message}`);
  }
})();
