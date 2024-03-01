const { kafkaTopicCfg, redisCfg } = require('@config/vars');
const redis = require('@config/redis');
const { getTopicName } = require('@utils/kafka');
const APTFund = require('@blockchains/funds/apt.fund');

class Monitor {
  constructor(api, config) {
    this.api = api;
    this.config = config;
  }

  /** Start monitor service **/
  async start () {
    const aptFund = new APTFund(this.api, this.config)
    const signal = await redis.get("dgt_signal")
    const resp = await aptFund.buy_asset()
    console.log("Dgt signal: ", signal, " -resp: ", resp)
  }
}

module.exports = Monitor;
