const redis = require('@config/redis');
const { logger } = require('@config/logger');
const { whiteLabelWalletPathFile } = require('@config/vars');
const fs = require('fs');

exports.getWalletInfo = async (network, addresses) => {
  let paths = await redis.hmget(network, addresses);
  let wallets = [];
  for (const [index, path] of paths.entries()) {
    if (!path) {
      logger.error(`[${network}] - get wallet info ${addresses[index]} failed: address not found in cached`);
      continue;
    }

    wallets.push({
      address : addresses[index],
      path    : paths[index]
    });
  }

  return wallets;
}

exports.getWalletObjects = async (network, addresses) => {
  let paths = await redis.hmget(network, addresses);
  let wallets = {};
  for (const [index, path] of paths.entries()) {
    if (!path) {
      logger.error(`[${network}] - get wallet info ${addresses[index]} failed: address not found in cached`);
      continue;
    }

    wallets[addresses[index]] = {
      address : addresses[index],
      path    : paths[index]
    };
  }

  return wallets;
}

exports.getWhiteLabelWallet = async (address) =>{
  const privKey = fs.readFileSync(`${whiteLabelWalletPathFile}/${address}.txt`, 'utf-8');
  if (!privKey) {
    logger.error(`[${network}] - get wallet info ${addresses} failed: key not found in path ${whiteLabelWalletPathFile}/${address}.txt`);
    return '';
  }
  return privKey
}
