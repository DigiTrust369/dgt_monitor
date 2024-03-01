// make bluebird default Promise
require('module-alias/register');
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { logger } = require('@config/logger');
const {
  port, env,
} = require('@config/vars');
const redis = require('@config/redis');
const {
  initKafka,
} = require('@config/kafka');
const app = require('@config/express');

(async () => {
  try {
    // set global variables for all module can use;
    global.redis = redis;
    global.logger = logger;
    logger.info('Establishing connection to kafka broker and run the monitor jobs.');
    // await initKafka();
    logger.info('Kafa connected');
    // API can start without kafka or redis, for offline used: sign transaction
    app.listen(port, () => logger.info(`Server started on port ${port} (${env})`));
  } catch (err) {
    logger.error(`Worker Job return error: ${err.message}`);
  }

  return true;
})();


/**
* Exports express
* @public
*/
module.exports = app;
