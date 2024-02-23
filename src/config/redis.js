const redis = require("redis");
const { promisify } = require('util');
const { logger } = require('@config/logger');
const { redisCfg } = require("@config/vars");

const options = {
  url: redisCfg.url
};

const client = redis.createClient(options);
const getAsync = promisify(client.get).bind(client);
const hmgetAsync = promisify(client.hmget).bind(client);
client.on('error', (e) => {
  logger.error(`Redis connection error: ${e.message}`);
});

client.on('connect', () => {
    logger.info('Redis connected');
});

// Create another client to get report message.
// this data will be return to dashboard via simple api call
if (redisCfg.isReportEnable === 'true') {
  const subscriber = redis.createClient(options);
  global.monitorReports = {};
  subscriber.on("message", function(channel, message) {
    let msg = JSON.parse(message);
    global.monitorReports[msg.network] = msg;
  });

  subscriber.subscribe('monitors.report');
}

module.exports = {
    client: client,
    set   : (key, value) => {
      client.set(key, value);
    },
    setExpire : (key, value, time) => {
      client.set(key, value, 'EX', time);
    },
    setex : (key, value, maxAge = 30 * 24 * 60 * 60) => {
      client.setex(key, maxAge, value);
    },
    hmset : (hash, values) => {
      client.hmset(hash, values);
    },
    get   : async (key) => {
      return getAsync(key);
    },
    hmget : async (hash, keys) => {
      if (!hash || !keys || keys.length <= 0) return [];
      return hmgetAsync(hash, keys);
    },
    del   : (key) => {
      client.del(key);
    },
};
