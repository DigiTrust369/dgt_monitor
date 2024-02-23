const Joi = require('@hapi/joi');
const Validator = require('multicoin-address-validator');
const { bitcoinCfg, bitcoinAbcCfg, litecoinCfg, dashCfg,
  ethCfg, neoCfg, rippleCfg, omniCfg, eosCfg, bitcoinSvCfg
} = require('@config/vars');

const Address = Joi.extend({
  type: 'address',
  base: Joi.string(),
  messages: {
      'address.invalid': '{{#label}} must be a valid {{#name}} {{#network}} address'
  },
  rules: {
    check: {
      method(args) {
        let blockchain = { name: args.name, network: args.network };
        return this.$_addRule({ name: 'check', args: { blockchain } });
      },
      validate(value, helpers, args, options) {
        let network = args.blockchain.network === 'mainnet' ? 'prod' : 'testnet';
        let valid = Validator.validate(value, args.blockchain.name, network);
        if (!valid) {
          return helpers.error('address.invalid', { name: args.blockchain.name, network: args.blockchain.network });
        }

        return value;
      }
    },
  }
});

const validations = (name, network) => {
  return Joi.array().items(Joi.object().keys({
    id        : Joi.string().required(),
    currency  : Joi.string().required(),
    contract  : Joi.string().allow(''),
    decimal   : Joi.number().positive().min(0).max(100),
    amount    : Joi.string().required(),
    address   : Address.address().check({ name: name, network: network }).required(),
    tag       : Joi.string().allow(''),
    contract_name  : Joi.string().allow(''),
    centralized_address  : Joi.string().allow(''),
    network   : Joi.string().required(),
    topic_prefix: Joi.string().required(),
  })).min(1)
}

const networks = {
  bitcoin     : validations('bitcoin', bitcoinCfg.network),
  bitcoin_abc : validations('BitcoinCash', bitcoinAbcCfg.network),
  litecoin    : validations('litecoin', litecoinCfg.network),
  dash        : validations('dash', dashCfg.network),
  ripple      : validations('ripple', 'mainnet'),
  ethereum    : validations('ethereum', 'mainnet'),
  binance     : validations('ethereum', 'mainnet'),
  neo         : validations('neo', 'mainnet'),
  omni        : validations('bitcoin', omniCfg.network),
  eos         : validations('eos', eosCfg.network),
  bitcoin_sv  : validations('BitcoinCash', bitcoinSvCfg.network),
  ethereum_classic    : validations('EthereumClassic', 'mainnet'),
  tezos       : validations('tezos', 'mainnet'),
  tron        : validations('tron', 'mainnet'),
  binance: validations('binance', 'mainnet')
};

module.exports = {
  // POST /v1/fund/withdrawal
  // POST /v1/fund/centralize
  prepare         : Joi.object({
    id            : Joi.string().required(),
    topic_prefix  : Joi.string(),
    data          : Joi.object().keys({
      bitcoin     : networks.bitcoin,
      bitcoin_abc : networks.bitcoin_abc,
      litecoin    : networks.litecoin,
      dash        : networks.dash,
      omni        : networks.omni,
      ethereum    : networks.ethereum,
      neo         : networks.neo,
      ripple      : networks.ripple,
      eos         : networks.eos,
      bitcoin_sv  : networks.bitcoin_sv,
      ethereum_classic  : networks.ethereum_classic,
      tezos       : networks.tezos,
      tron        : networks.tron,
      binance: networks.binance,
    }).required().min(1)
  }),
  withdrawal      : Joi.object().keys({
    id            : Joi.string().required(),
    currency      : Joi.string().required(),
    contract      : Joi.string().allow(''),
    decimal       : Joi.number().positive().min(0).max(100),
    amount        : Joi.string().required(),
    address       : Joi.string().required(),
    tag           : Joi.string().allow(''),
    contract_name : Joi.string().allow(''),
    network       : Joi.string().required(),
    topic_prefix  : Joi.string().required(),
    whitelable_withdraw_address: Joi.string().allow(''),
    whitelabel_name: Joi.string().allow('')
  }),
  centralize      : Joi.object().keys({
    id            : Joi.string().required(),
    currency      : Joi.string().required(),
    contract      : Joi.string().allow(''),
    decimal       : Joi.number().positive().min(0).max(100),
    amount        : Joi.string().required(),
    address       : Joi.string().required(),
    tag           : Joi.string().allow(''),
    contract_name : Joi.string().allow(''),
    centralized_address  : Joi.string().allow(''),
    network       : Joi.string().required(),
    topic_prefix  : Joi.string().required(),
  })
};
