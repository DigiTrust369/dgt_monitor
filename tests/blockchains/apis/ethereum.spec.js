// require('module-alias/register');
// const assert = require('assert');
// const EthereumApi = require('@blockchains/apis/ethereum.api');
// const { ethereum } = require('@tests/blockchains/apis/samples');
// const { ethCfg } = require('@config/vars');

// describe('Ethereum RPC Api Tests', () => {
//   const address = '0xea6e38dd0fefcb8492adfd5069628d41636d8d96';
//   let api;

//   describe('Base method tests', () => {
//     before(function () {
//       if (!ethCfg.rpcUrls || ethCfg.rpcUrls.length <= 0) {
//         this.skip();
//       }

//       api = new EthereumApi();
//     });

//     it('Should return correct body', () => {
//       const method = 'listunspent';
//       const params = [ethCfg.unspentMinConf, ethCfg.unspentMaxConf, [address]];
//       let body = api.body(method, params);
//       const result = {
//         jsonrpc   : "2.0",
//         id        : "1",
//         method    : 'listunspent',
//         params    : [ethCfg.unspentMinConf, ethCfg.unspentMaxConf, [address]]
//       };

//       assert.deepEqual(body, result);
//     });

//     it('Should throw error if response with error', () => {
//       const response = {
//         error: {
//           message: 'samples'
//         }
//       };

//       try {
//         api.validateRes(response);
//         assert.fail('Should throw error.');
//       } catch (e) {
//         assert.equal(e.message, `RPC response error: ${response.error.message}`)
//       }
//     });

//     it('Should return the response results if no error return', () => {
//       const response = {
//         result: "samples"
//       };

//       try {
//         let result = api.validateRes(response);
//         assert.equal(result, response.result);
//       } catch (e) {
//         assert.fail('Should not throw error.');
//       }
//     });
//   });

//   describe('Apis Tests', () => {
//     before(function () {
//       if (!ethCfg.rpcUrls || ethCfg.rpcUrls.length <= 0) {
//         this.skip();
//       }

//       api = new EthereumApi();
//     });

//     it('Should convert ETH to unit as bignumber', () => {
//       let amount = "1";
//       let converted = api.toUnit(amount, 18);
//       assert.equal(typeof converted, 'object');
//       assert.equal(converted.toString(), "1000000000000000000");
//     });

//     it('Should convert uint to currency', () => {
//       let amount = "1000000000000000000";
//       let converted = api.toCurrency(amount, 18);
//       assert.equal(converted, "1");
//     });

//     it('Should throw error if trying to convert invalid amount', () => {
//       let amounts = [-10, 'ten'];
//       for (let amount of amounts) {
//         assert.throws(() => {
//           return api.toUnit(amount, 10);
//         }, {
//           name: 'Error',
//           message: `[${ethCfg.name}] - Invalid eth/token amount ${amount} to convert.`
//         })
//       }
//     });

//     it('Should return current block number', async () => {
//       let block = await api.getBlockCount();
//       assert.equal(typeof block, 'number');
//       assert.equal(block > 0, true);
//     });

//     it('Should return correct block info get by height', async () => {
//       let info = await api.getBlock(ethereum.block.number);
//       assert.deepEqual(info, ethereum.block.info);
//     });

//     it('Should return transactions count of an address', async () => {
//       let count = await api.getTransactionCount(address);
//       assert.equal(typeof count, 'string');
//       assert.equal(count.indexOf('0x') === 0, true);
//       assert.equal(parseInt(count, 16) >= 0, true);
//     });

//     it('Should return transaction receipt', async () => {
//       let receipt = await api.getTransactionReceipt(ethereum.transaction.hash);
//       assert.deepEqual(receipt, ethereum.transaction.receipt);
//     });

//     it('Should return transaction info', async () => {
//       let info = await api.getTransactionByHash(ethereum.transaction.hash);
//       assert.deepEqual(info, ethereum.transaction.info);
//     });

//     it('Should return eth balance', async () => {
//       let info = await api.getBalance(address);
//       assert.equal(typeof info, 'string');
//       assert.equal(info.length > 0, true);
//       assert.equal(parseInt(info, 16) >= 0, true);
//     });

//     it('Should return erc20 balance', async () => {
//       let contract_address = '0xdac17f958d2ee523a2206206994597c13d831ec7';
//       let data = '0x70a08231000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e';
//       let info = await api.ethCall(contract_address, data);
//       assert.equal(typeof info, 'string');
//       assert.equal(info.length, 66);
//       assert.equal(parseInt(info, 16) >= 0, true);
//     });

//     it('Should throw error when send the old transaction', async () => {
//       try {
//         let tx = await api.sendRawTransaction(ethereum.transaction.raw);
//         assert.fail('Should throw error.');
//       } catch (e) {
//         assert.equal(e.message, `RPC response error: nonce too low`)
//       }
//     });
//   });
// });
