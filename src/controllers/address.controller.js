const httpStatus = require('http-status');
const addressService = require('@services/address.service');
const { logger } = require('@config/logger');
const { handler: errorHandler } = require('@middlewares/error');

/**
 * Generate Address
 * @public
 */
exports.generateAddress = async (req, res, next) => {
  try {
    const address = await addressService.generateAddress({
      network: req.params.network,
      accountId: req.params.account_id,
      addressId: req.params.address_id,
      topic_prefix: req.headers['topic-prefix']
    });
    res.json({
      code: 0,
      data: address
    });
  } catch (error) {
    logger.error(`Create new address for account ${req.params.account_id} on ${req.params.network} failed: ${error.message}`);
    next(error);
  }
};

/**
 * Validate Address
 * @public
 */
exports.validate = async (req, res, next) => {
  let network = req.params.network;
  let address = req.params.address;

  try {
    const valid = await addressService.validate(network, address);
    res.json({
      code  : 0,
      data  : { valid }
    });
  } catch (error) {
    logger.error(`Validate address ${network} - ${address} failed: ${error.message}`);
    next(error);
  }
};
