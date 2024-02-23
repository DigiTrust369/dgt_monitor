const path = require('path');
const env = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({
  path: path.join(__dirname, '../../' + env)
});

module.exports = Object.freeze({
  networkMode         : process.env.NETWORK_MODE,
  networkNameMaps     : {
    ethereum          : 'Ethereum',
    binance: 'Ethereum', //using ethereum since multicoin-address-validator SDK has not support to validate binance chain
  },
  mainnetOnly         : process.env.MAINNET_ONLY ? process.env.MAINNET_ONLY.split(',') : ['ethereum'],
});
