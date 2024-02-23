const httpStatus = require('http-status');
const Validator = require('multicoin-address-validator');
const APIError = require('@utils/api.error');
const { addresses, apis } = require('@blockchains');
const redis = require('@config/redis');
const { networkMode, networkNameMaps, mainnetOnly } = require('@config/validators');

exports.generateAddress = async (params) => {
  if (!addresses.hasOwnProperty(params.network)) {
    throw new APIError({
      message: `Blockchain network ${params.network} is not supported.`,
      status: httpStatus.BAD_REQUEST,
    });
  }

  try {
    let info = await addresses[params.network].generate(params.accountId, params.addressId);
    let key = info.tag.length > 0 ? info.address + "." + info.tag : info.address;
    await redis.hmset(params.network, { [key]: info.path || info.tag });
    // save topic_prefix to send deposit data later
    if (params.topic_prefix) await redis.hmset(`${params.network}.topics`, { [key]: params.topic_prefix });
    await apis[params.network].importAddress(info.address);
    return info;
  } catch (e) {
    throw new APIError({
      message: e.message,
      status: httpStatus.INTERNAL_SERVER_ERROR,
    });
  }
};

exports.validate = async (network, address) => {
  if (!network || !address) {
    throw new APIError({
      message : `Bad request`,
      status  : httpStatus.BAD_REQUEST,
    });
  }

  if (!networkNameMaps[network] || !Validator.findCurrency(networkNameMaps[network])) {
    throw new APIError({
      message: `Blockchain network ${network} is not supported.`,
      status: httpStatus.BAD_REQUEST,
    });
  }

  let networkType = networkMode === 'mainnet' ? 'prod' : 'testnet';
  if (mainnetOnly.includes(network)) networkType = 'prod';
  let valid = Validator.validate(address, networkNameMaps[network], networkType);
  return valid;
};
