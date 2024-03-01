const { logger } = require('@config/logger');
const MoveFund = require('@blockchains/funds/move.fund')
// const redis = require("redis");
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

exports.getSignal = async(req, res, next) =>{
  const signal = await redis.get('sui_signal')
  return res.json({
    data:signal
  })
}

exports.getAptSignal = async(req, res, next) =>{
  let moveFund = new MoveFund();
  const resp = await moveFund.fetchList()

  //generate confirm to handle new token as
  const list_loss = await moveFund.fetchList();

  //using to make new connection 
  

  return res.json({
    data: resp
  })
}