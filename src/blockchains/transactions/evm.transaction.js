require('module-alias/register');
const Common = require('ethereumjs-common').default;
const EthereumTx = require('ethereumjs-tx').Transaction;
const Transaction = require('@blockchains/transactions/transaction');
const EVMApi = require('@blockchains/apis/evm.api');
const { getPrivateKey } = require('@blockchains/addresses/evm.address');
const { evmCfg } = require('@config/vars');

class EVMTransaction extends Transaction {
  constructor(api, config, common) {
    api = api || new EVMApi();
    config = config || evmCfg;
    super(api, config);
    this.getPrivateKey = getPrivateKey;
    const customChainParams = { name: 'custom', chainId: config.chainId, networkId: config.networkId }
    const customChainCommon = Common.forCustomChain('mainnet', customChainParams, 'byzantium')
    this.common = common || customChainCommon;
  }

  /** return this network name, we need it to set the right apis['network']
   * refer /src/blockchains/index.js for more details
  **/
  static get network () {
    return evmCfg.name;
  }

  /** Create and sign transaction from the prepare data make by withdrawal or merge fund sevice
    * @params prepares: [{
    *    wallet     : {
    *      address  : '1Po1oWkD2LmodfkBYiAktwh76vkF93LKnh',
    *      path     : 'm/44/0/0'
    *    },
    *    data       : '0x',
    *    gasPrice   : '0x77359400',
    *    gasLimit   : '0x5208',
    *    to         : '0x2d000c3ddea6bb3b695af6aa116265a33299a1f5',
    *    value      : '0x38d7ea4c68000',
    *    nonce      : '0x0'
    *  }]
  **/
  create (prepares) {
    let raws = [];
    for (let prepare of prepares) {
      let tx = new EthereumTx(prepare, { common: this.common });
      let priv = this.getPrivateKeys(prepare.wallet)[0];
      if(prepare.privKey && prepare.privKey.length > 0){
        priv = prepare.privKey
      }
      let privateKey = Buffer.from(priv, 'hex');
      tx.sign(privateKey);
      raws.push({
        id    : prepare.id,
        tx    : '0x' + tx.serialize().toString('hex'),
        txId  : '0x' + tx.hash().toString('hex'),
        // for report purpose
        fee   : Number(prepare.fee),
        amount: Number(prepare.amount)
      });
    }

    return raws;
  }
}

module.exports = EVMTransaction;
