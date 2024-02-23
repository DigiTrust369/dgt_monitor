require('module-alias/register');
const assert = require('assert');
const EthereumTransaction = require('@blockchains/transactions/ethereum.transaction');
const EthereumApi = require('@blockchains/apis/ethereum.api');
const { ethCfg } = require('@config/vars');

describe('Ethereum transaction tests', () => {
  let sample = {
    prepare : [{
      id: 0,
      data: '0x',
      gasPrice: '0x77359400',
      gasLimit: '0x5208',
      to: '0x003bbce1eac59b406dd0e143e856542df3659075',
      value: '0x2386f26fc10000',
      nonce: '0x1',
      decimal   : 18,
      amount    : '0.01',
      fee       : "0.000042"
    }, {
      id: 1,
      data: '0xa9059cbb000000000000000000000000003bbce1eac59b406dd0e143e856542df3659075000000000000000000000000000000000000000000000000002386f26fc10000',
      gasPrice: '0x77359400',
      gasLimit: '0x186a0',
      to: '0xFab46E002BbF0b4509813474841E0716E6730136',
      value: '0x0',
      nonce: '0x2',
      decimal   : 18,
      amount    : '0.01',
      fee       : "0.000042"
    }],
    raws : [{
      id: 0,
      tx: '0xf86a01847735940082520894003bbce1eac59b406dd0e143e856542df3659075872386f26fc100008077a04d18b242bf89d6b00ad09298a233ca8634ec61b6e5fccbc5e225a059bfac8954a07267c65086ea117e0841f8c222c01d53485d8596cdfdfb4fd5b9a9796df855c9',
      txId: '0x8ac5f90ea55be12cade76be039dcbc4cf900aeca28a9982a3ca6cf2cb4b936be',
      fee   : 0.000042,
      amount: 0.01
    }, {
      id: 1,
      tx: '0xf8a9028477359400830186a094fab46e002bbf0b4509813474841e0716e673013680b844a9059cbb000000000000000000000000003bbce1eac59b406dd0e143e856542df3659075000000000000000000000000000000000000000000000000002386f26fc1000077a08eee05065047658b1115e224a0ba3a3e666cb5cca3085c04d4880695e2641337a04d169dc697674329237314360f75bce9d47f6bae5f9c71a3c9956a8c1bb55d23',
      txId: '0x1bb96eb1f0e0758b0ebfeb428ae1b4b9fe45c16b28f9ec24e8f2bdeee7e97aa5',
      fee   : 0.000042,
      amount: 0.01
    }]
  };

  // this test can run without rpc call
  let config = Object.assign({}, ethCfg);
  config.rpcUrls = config.rpcUrls || 'http://127.0.0.1:8545';
  let api = new EthereumApi(config);
  api.sendRawTransaction = (raw) => {
    return true;
  }
  let ethereum = new EthereumTransaction(api, config);

  it('Should return correct network name', () => {
    assert.equal(EthereumTransaction.network, ethCfg.name);
  });

  it('Should create raw transaction for valid prepare data', () => {
    let raws = ethereum.create(sample.prepare);
    assert.deepEqual(raws, sample.raws);
  });

  it('Should return private key for a wallet path', () => {
    // withdrawal wallet
    let withdrawalPriv = ethereum.getPrivateKeys();
    assert.deepEqual(withdrawalPriv, [ethCfg.withdrawalPriv]);

    // address wallet, ethereum wallet info is an object
    let wallets = {
      address: '0xf83c07ed0698132476b37e513e24b00597fee2ca',
      path   : 'm/44/60/12'
    }

    let privs = ethereum.getPrivateKeys(wallets);
    assert.deepEqual(privs, ['000ae14c9171aba0f412f4990de3b567932c94ee60a3d8fef15e3ce87650f5bc']);
  });

  it('Should return correct format after send transaction', async () => {
    let results = await ethereum.send(sample.raws[0]);
    assert.deepEqual(results, {
      additionFee: 0,
      txId  : '0x8ac5f90ea55be12cade76be039dcbc4cf900aeca28a9982a3ca6cf2cb4b936be',
    })
  });
});
