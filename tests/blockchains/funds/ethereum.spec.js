// require('module-alias/register');
// const assert = require('assert');
// const BigNumber = require('bignumber.js');
// const EthereumFund = require('@blockchains/funds/ethereum.fund');
// const EthereumApi = require('@blockchains/apis/ethereum.api');
// const { ethCfg } = require('@config/vars');
// const redis = require('@config/redis');

// describe('Ethereum funds prepare tests', () => {
//   const sample = {
//     balance: {
//       ethereum : "0x299e70696e50e000",  // 2.998958 eth
//       erc20    : "0x8AC7230489E80000"   // 10
//     },
//     account: {
//       balances: {
//         ethereum : new BigNumber('0x299e70696e50e000'),
//         "0xFab46E002BbF0b4509813474841E0716E6730136" : new BigNumber('0x8AC7230489E80000')
//       },
//       nonce   : 1
//     },
//     withdrawals: [{
//       id          : 0,
//       currency    : "ETH",
//       contract    : "",
//       decimal     : 18,
//       amount      : "0.01",
//       address     : "0x003bbce1eac59b406dd0e143e856542df3659075",
//       gasLimit    : 21000,
//       from        : "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4"
//     }, {
//       id          : 1,
//       currency    : "FAU",
//       contract    : "0xFab46E002BbF0b4509813474841E0716E6730136",
//       decimal     : 18,
//       amount      : "0.01",
//       address     : "0x003bbce1eac59b406dd0e143e856542df3659075",
//       gasLimit    : 100000,
//       from        : "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4"
//     }],
//     centralizes: [{
//       id          : 0,
//       currency    : "ETH",
//       contract    : "",
//       decimal     : 18,
//       amount      : "0.01",
//       address     : "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//       gasLimit    : 21000,
//       centralized_address: "0x9b95135b2bcfbfe92540db89bf8b7df9ea6a4ed5"
//     }, {
//       id          : 1,
//       currency    : "FAU",
//       contract    : "0xFab46E002BbF0b4509813474841E0716E6730136",
//       decimal     : 18,
//       amount      : "0.01",
//       address     : "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//       gasLimit    : 100000,
//       centralized_address: "0x9b95135b2bcfbfe92540db89bf8b7df9ea6a4ed5"
//     }],
//     prepare: {
//       withdrawal: [
//         {
//           "id": 0,
//           "data": "0x",
//           "gasPrice": "0x77359400",
//           "gasLimit": "0x5208",
//           "from": "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//           "to": "0x003bbce1eac59b406dd0e143e856542df3659075",
//           "value": "0x2386f26fc10000",
//           "nonce": "0x1",
//           "decimal": 18,
//           "amount": "0.01",
//           "fee": "0.000042",
//           "type": undefined
//         },
//         {
//           "id": 1,
//           "data": "0xa9059cbb000000000000000000000000003bbce1eac59b406dd0e143e856542df3659075000000000000000000000000000000000000000000000000002386f26fc10000",
//           "gasPrice": "0x77359400",
//           "gasLimit": "0x186a0",
//           "from": "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//           "to": "0xFab46E002BbF0b4509813474841E0716E6730136",
//           "value": "0x0",
//           "nonce": "0x2",
//           "decimal": 18,
//           "amount": "0.01",
//           "fee": "0.0002",
//           "type": undefined
//         }
//       ],
//       centralize: [{
//         "id": 1,
//         "data": "0xa9059cbb0000000000000000000000009b95135b2bcfbfe92540db89bf8b7df9ea6a4ed50000000000000000000000000000000000000000000000008ac7230489e80000",
//         "gasPrice": "0x77359400",
//         "gasLimit": "0x186a0",
//         "to": "0xFab46E002BbF0b4509813474841E0716E6730136",
//         "value": "0x0",
//         "nonce": "0x1",
//         "wallet": {
//           "address": "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//           "path": "m/44/0/12"
//         },
//         "decimal": 18,
//         "amount": '10',
//         "fee": '0.0002',
//         from: "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//         type: undefined,
//       }, {
//         "id": 0,
//         "data": "0x",
//         "gasPrice": "0x77359400",
//         "gasLimit": "0x5208",
//         "to": "0x9b95135b2bcfbfe92540db89bf8b7df9ea6a4ed5",
//         "value": "0x299d94506a47c000",
//         "nonce": "0x2",
//         "wallet": {
//           "address": "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//           "path": "m/44/0/12"
//         },
//         "decimal": 18,
//         "amount": '2.998716',
//         "fee": '0.000042',
//         from: "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//         type: undefined,
//       }],
//       withdrawalForCentralize: [{
//         id: 1,
//         data: '0x',
//         gasPrice: '0x77359400',
//         gasLimit: '0x5208',
//         to: '0x9b95135b2bcfbfe92540db89bf8b7df9ea6a4ed5',
//         value: '0xb5e620f48000',
//         nonce: '0x1',
//         amount: "0.0002",
//         decimal: 18,
//         fee: "0.000042",
//         type: "merge_fund_fee",
//         from: "0xb87bd5e30d05be9d8fdb1d208982933705af6cf4",
//       }, {
//         id: 1,
//         data: '0xa9059cbb0000000000000000000000009b95135b2bcfbfe92540db89bf8b7df9ea6a4ed50000000000000000000000000000000000000000000000008ac7230489e80000',
//         gasPrice: '0x77359400',
//         gasLimit: '0x186a0',
//         to: '0xFab46E002BbF0b4509813474841E0716E6730136',
//         value: '0x0',
//         nonce: '0x1',
//         wallet: {
//           address: '0x9b95135b2bcfbfe92540db89bf8b7df9ea6a4ed5',
//           path: 'm/44/0/12'
//         },
//         amount: "10",
//         decimal: 18,
//         fee: "0.0002",
//         type: undefined,
//         from: "0x9b95135b2bcfbfe92540db89bf8b7df9ea6a4ed5",
//       }]
//     }
//   }

//   // this test can run without rpc call
//   let config = Object.assign({}, ethCfg);
//   config.rpcUrls = config.rpcUrls || 'http://127.0.0.1:8545';
//   let api = new EthereumApi(config);
//   api.getBalance = (address) => {
//     if (address == ethCfg.withdrawalAddr) {
//       return sample.balance.ethereum;
//     }

//     return '0x0';
//   };
//   api.getNonce = (address) => { return sample.account.nonce };
//   api.getErc20Balance = (address) => { return sample.balance.erc20 };
//   let eth = new EthereumFund(api, config);

//   describe('Units test', () => {
//     it('Should return correct network name', () => {
//       assert.equal(EthereumFund.network, ethCfg.name);
//     });

//     it('Should build the erc20 data', () => {
//       let transfer = {
//         address : '0x003bbce1eac59b406dd0e143e856542df3659075',
//         amount  : 1,
//         decimal : 18
//       };

//       {
//         let data = eth.buildTransferData(transfer);
//         assert.equal(data, '0x');
//       }
//       transfer.contract = '0xFab46E002BbF0b4509813474841E0716E6730136';
//       {
//         let data = eth.buildTransferData(transfer);
//         assert.equal(data, '0xa9059cbb000000000000000000000000003bbce1eac59b406dd0e143e856542df36590750000000000000000000000000000000000000000000000000de0b6b3a7640000');
//       }
//     });
//   });

//   describe('Prepare data test', () => {
//     afterEach(function (done) {
//       sample.withdrawals[0].amount = '0.01';
//       sample.withdrawals[1].amount = '0.01';
//       sample.account.balances.ethereum = new BigNumber(sample.balance.ethereum);
//       done();
//     });

//     it('Should prepare data for valid input', () => {
//       let prepare = eth.prepare(sample.account, sample.withdrawals);
//       assert.deepEqual(prepare, sample.prepare.withdrawal);
//     });

//     it('Should throw error if withdrawal smaller than minimum withdrawal', () => {
//       sample.withdrawals[1].amount = "0";
//       assert.throws(() => {
//         return eth.prepare(sample.account, sample.withdrawals);
//       }, {
//         name: 'Error',
//         message: `[${config.name}] - Prepare id 1 error: invalid target's amount: 0`
//       });
//     });

//     it('Should throw error if not enough eth to withdrawal', () => {
//       sample.withdrawals[0].amount = "99";
//       assert.throws(() => {
//         return eth.prepare(sample.account, sample.withdrawals);
//       }, {
//         name: 'Error',
//         message: `[${config.name}] - Not enough eth/erc20 balance to withdrawal: have 2998958000000000000, need: 99000000000000000000`
//       });
//     });

//     it('Should throw error if not enough eth to pay fee', () => {
//       sample.account.balances.ethereum = new BigNumber(0);
//       assert.throws(() => {
//         return eth.prepare(sample.account, [sample.withdrawals[1]]);
//       }, {
//         name: 'Error',
//         message: `[${config.name}] - Not enough eth to pay for fee and/or transfer: have 0, need: 200000000000000`
//       });
//     });
//   });

//   describe('Withdrawal test', () => {
//     afterEach(function (done) {
//       sample.withdrawals[0].amount = '0.01';
//       sample.withdrawals[1].amount = '0.01';
//       done();
//     });

//     it('Should prepare data for valid withdrawals', async () => {
//       let data = await eth.withdrawal(sample.withdrawals);
//       assert.deepEqual(data, sample.prepare.withdrawal);
//     });

//     it('Should return empty prepare data if invalid withdrawals input', async () => {
//       let prepare = await eth.withdrawal();
//       assert.deepEqual(prepare, []);
//     });

//     it('Should throw error if withdrawal smaller than minimum withdrawal', async () => {
//       sample.withdrawals[0].amount = "0";
//       try {
//         let prepare = await eth.withdrawal(sample.withdrawals);
//         assert.fail("Should throw error");
//       } catch (e) {
//         assert.equal(e.name, 'Error');
//         assert.equal(e.message, `[${config.name}] - Prepare id 0 error: invalid target's amount: 0`);
//       }
//     });

//     it('Should throw error if withdrawal smaller than minimum neo withdrawal', async () => {
//       sample.withdrawals[1].amount = "0";
//       try {
//         let prepare = await eth.withdrawal(sample.withdrawals);
//         assert.fail("Should throw error");
//       } catch (e) {
//         assert.equal(e.name, 'Error');
//         assert.equal(e.message, `[${config.name}] - Prepare id 1 error: invalid target's amount: 0`);
//       }
//     });
//   });

//   describe('Merge fund test', () => {
//     it('Should prepare data for valid source', async () => {
//       await redis.hmset(ethCfg.name, { [sample.centralizes[0].address]: 'm/44/0/12' });
//       let data = await eth.centralize(sample.centralizes);
//       assert.deepEqual(data, sample.prepare.centralize);
//     });

//     it('Should withdrawal some eth if not enough eth to pay for erc20 centralize fee', async () => {
//       await redis.hmset(ethCfg.name, { [sample.centralizes[0].address]: 'm/44/0/12' });
//       let data = await eth.centralize([sample.centralizes[0]]);
//       assert.deepEqual(data, sample.prepare.withdrawalForCentralize);
//     });

//     it('Should return empty prepare data if invalid withdrawals input', async () => {
//       let prepare = await eth.withdrawal();
//       assert.deepEqual(prepare, []);
//     });
//   });
// });
