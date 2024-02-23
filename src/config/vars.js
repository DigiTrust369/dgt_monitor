const path = require('path');
const env = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({
  path: path.join(__dirname, '../../' + env)
});

module.exports = Object.freeze({
  env                 : process.env.NODE_ENV || 'production',
  port                : process.env.PORT || 3001,
  logs                : process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  logLevels           : {
    file              : process.env.FILE_LOG_LEVEL || 'info',
    console           : process.env.CONSOLE_LOG_LEVEL || 'debug',
    sentry            : process.env.SENTRY_LOG_LEVEL || 'error'
  },
  sentryDsn           : process.env.SENTRY_DSN,
  tagStartNumber      : parseInt(process.env.TAG_START) || 435793,
  redisCfg            : {
    url               : process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    reportChannel     : process.env.REDIS_REPORT_CHANNEL || 'monitors.report',
    isReportEnable    : process.env.REDIS_REPORT_ENABLE || 'true',
  },
  requestTimeout      : parseInt(process.env.REQUEST_TIMEOUT) || 50000,
  shortTimeout        : parseInt(process.env.SHORT_REQUEST_TIMEOUT) || 5000,
  overrideBlockInterval: parseInt(process.env.OVERRIDE_START_BLOCK_INTERVAL) || 30000,
  monitorDelayInterval: parseInt(process.env.MONITOR_FULLNODE_DELAY_INTERVAL) || 60000,
  networks            : process.env.MONITOR_NETWORKS ? process.env.MONITOR_NETWORKS.split(',') : [],
  cronTime            : process.env.CRON_TIME || '*/1 * * * * *',
  preparers           : process.env.PREPARERS || 'vnd-devs',
  prepareFileName     : process.env.PREPARE_FILE_NAME || 'transactions.prepare',
  signedFileName      : process.env.SIGNED_FILE_NAME || 'transactions.signed',
  rsaKeys             : {
    public            : process.env.RSA_PUB,
    private           : process.env.RSA_PRIV
  },
  awsCfg              : {
    accessKey         : process.env.AWS_ACCESS_KEY_ID,
    secret            : process.env.AWS_SECRET_ACCESS_KEY,
    bucket            : process.env.AWS_BUCKET
  },
  kafkaCfg            : {
    clientId          : process.env.KAFKA_CLIENT_ID || 'crypto-wallet',
    urls              : process.env.KAFKA_URLS || '127.0.0.1:9092',
    schemaRegistry    : process.env.KAFKA_SCHEMA_REGISTRY || 'http://127.0.0.1:8081',
    groupId           : process.env.KAFKA_GROUP_ID || 'crypto-wallet',
    heartbeatInterval : parseInt(process.env.KAFKA_HEARTBEAT_INTERVAL) || 3000,
    sessionTimeout    : parseInt(process.env.KAFKA_SESSION_TIMEOUT) || 10000
  },
  kafkaTopicCfg       : {
    deposit           : process.env.KAFKA_MONITOR_DEPOSIT_TOPIC || 'deposit',
    transaction       : process.env.KAFKA_MONITOR_TRANSACTION_TOPIC || 'transaction',
    prepare           : process.env.KAFKA_PREPARE_TOPIC || 'prepare',
    fund              : process.env.KAFKA_FUND_TOPIC || 'fund',
    paymentTopic       : process.env.KAFKA_FUND_REQUEST_TOPIC || 'dgt-fund-request-development',
  },
  blockCache          : {
    networks          : process.env.BLOCK_CACHE_NETWORKS || 'tron',
    cacheTime         : process.env.BLOCK_CACHE_TIME || 3600
  },
  evmCfg:{
    name: 'binance',
    symbol            : 'BNB',
    masterPubKey      : process.env.BINANCE_MASTER_PUB_KEY,
    masterPrivKey     : process.env.BINANCE_MASTER_PRIV_KEY,
    hdPath            : 'm/44/714/',
    network: process.env.BINANCE_NETWORK || 'mainnet',
    chainId: parseInt(process.env.BINANCE_CHAINID) || 97, // 97 for testnet
    minConfirmation   : parseInt(process.env.BINANCE_MIN_CONFIRMATION) || 20,
    networkId         : parseInt(process.env.BINANCE_NETWORK_ID) || 97,
    rpcUrls           : process.env.BINANCE_RPC_URLS,
    withdrawalAddr    : process.env.BINANCE_WITHDRAWAL_ADDR,
    withdrawalPriv    : process.env.BINANCE_WITHDRAWAL_PRIV,
    centralizeAddr    : process.env.BINANCE_CENTRALIZE_ADDR,
    fees:{
      gasPrice: parseInt(process.env.BINANCE_GAS_PRICE) || 10000000000,
      maxGasPrice: parseInt(process.env.BINANCE_MAX_GAS_PRICE) || 150000000000,
      maxGasLimit     : parseInt(process.env.BINANCE_ETH_GAS_LIMIT) || 21000,
      maxBep20GasLimit: parseInt(process.env.BINANCE_MAX_ERC20_GAS_LIMIT) || 100000
    },
    gasTrackerApi     : process.env.BINANCE_GAS_TRACKER_API || `https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=`,
    gasTrackerKey     : process.env.BINANCE_GAS_TRACKER_KEY || `J5VAWY6QTCUU9Y83HDZZXP1G1GV6YYJKW8`,
    maxDelayedBlock   : parseInt(process.env.BINANCE_MAX_DELAYED_BLOCK) || 100,
    withdrawalDelay   : parseInt(process.env.BINANCE_WITHDRAWAL_DELAY_SEC) || 2, // delay 2 second each transaction send from the withdrawal address
    centralizeDelay   : parseInt(process.env.BINANCE_CENTRALIZE_DELAY_SEC) || 5, // not sure, have to check on mainnet
  },
  decimalCfg: parseInt(process.env.DECIMAL_CONFIG) || 8,
  whiteLabelWalletPathFile: process.env.WHITELABEL_WALLET_PATH_FILE || '/app/src/white_label'
});
