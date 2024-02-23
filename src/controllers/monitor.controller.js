const { logger } = require('@config/logger');

/**
 * Set new start block for monitor
 * @public
 */
exports.setBlock = async (req, res, next) => {
  try {
    for (const [network, block] of Object.entries(req.body)) {
      logger.info(`Set new start block for blockchain ${network}: ${block}`);
      await redis.set(`${network}.start-process-block`, block);
    }

    res.json({ code: 0, data: true });
  } catch (e) {
    logger.error(`Set block num failed: ${e.message}`);
    next(e);
  }
};

/**
 * reports
 * @public
 */
exports.report = async (req, res, next) => {
  return res.json(global.monitorReports);
};
