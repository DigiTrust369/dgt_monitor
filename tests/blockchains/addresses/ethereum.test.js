// require('module-alias/register');
// const { addresses } = require('@blockchains');
// const assert = require('assert');
// const Validator = require('multicoin-address-validator');
// const ethereumjs = require("ethereumjs-util");
// const HDKey = require('hdkey');
// const httpStatus = require('http-status');
// const { ethCfg } = require('@config/vars');
// const { ethereum: samples } = require('@tests/blockchains/addresses/samples');
// const NUMBER_OF_TEST_IDS = process.env.NUMBER_OF_TEST_IDS || 10;

// describe('Ethereum Address Test', () => {
//   let masterPubKey = process.env.ETHEREUM_MASTER_PUB_KEY;
//   let masterPrivKey = process.env.ETHEREUM_MASTER_PRIV_KEY;

//   it('Should define Ethereum master key in test environment', () => {
//     assert.equal(masterPubKey.length > 0, true);
//     assert.equal(masterPrivKey.length > 0, true);
//   });

//   it('Should define a Ethereum property', () => {
//     assert.equal(addresses.hasOwnProperty('ethereum'), true);
//   });

//   it('Should define Ethereum\'s generate address property', () => {
//     let address = addresses.ethereum;
//     assert.equal(address.hasOwnProperty('generate'), true);
//   });

//   it('Should return result in correct format', async () => {
//     let address = addresses.ethereum;
//     let result = await address.generate(1);
//     assert.equal(result.hasOwnProperty('address'), true);
//     assert.equal(result.hasOwnProperty('pubkey'), true);
//     assert.equal(result.hasOwnProperty('path'), true);
//     assert.equal(result.hasOwnProperty('tag'), true);
//   });

//   it('Should return Ethereum address', async () => {
//     let accountIds = Array.from({length: NUMBER_OF_TEST_IDS}, () => Math.floor(Math.random() * 10000));
//     let addressIds = Array.from({length: NUMBER_OF_TEST_IDS}, () => Math.floor(Math.random() * 10000));
//     let address = addresses.ethereum;
//     for (let i = 0; i < accountIds.length; i++) {
//       let id = accountIds[i];
//       let result = await address.generate(id);
//       let isValidAddress = Validator.validate(result.address, 'ethereum', ethCfg.network);
//       assert(isValidAddress, true);
//     };

//     for (let i = 0; i < 10; i++) {
//       for (let j = 0; j < addressIds.length; j++) {
//         let addressId = addressIds[j];
//         let result = await address.generate(i, addressId);
//         let isValidAddress = Validator.validate(result.address, 'ethereum', ethCfg.network);
//         assert.equal(isValidAddress, true);
//       };
//     }
//   });

//   it('Should return same data compare to samples data in case priv/pubkey are same', async () => {
//     assert(masterPubKey === samples.publicKey, true);
//     assert(masterPrivKey === samples.privateKey, true);
//     let address = addresses.ethereum;
//     for (let i = 0; i < samples.data.length; i++) {
//       let data = samples.data[i];
//       let result = await address.generate(data.index);
//       assert(result.address === data.address, true);
//       assert(result.pubkey === data.pubkey, true);
//     };

//     for (let i = 0; i < samples.address.length; i++) {
//       let data = samples.address[i];
//       let result = await address.generate(data.account, data.index);
//       assert.equal(result.address, data.address);
//       assert.equal(result.pubkey, data.pubkey);
//     };
//   });

//   it('Should using same elliptic curve when derive using private key', async () => {
//     let accountIds = Array.from({length: NUMBER_OF_TEST_IDS}, () => Math.floor(Math.random() * 10000));
//     let addressIds = Array.from({length: NUMBER_OF_TEST_IDS}, () => Math.floor(Math.random() * 10000));
//     let address = addresses.ethereum;
//     for (let i = 0; i < accountIds.length; i++) {
//       let id = accountIds[i];
//       let result = await address.generate(id);

//       let node = HDKey.fromExtendedKey(masterPrivKey);
//       let child = node.derive(ethCfg.hdPath + `${id}`);
//       let publicKey = ethereumjs.importPublic(child.publicKey);
//       let addrFromPriv = '0x' + ethereumjs.pubToAddress(publicKey).toString('hex');

//       assert(result.address === addrFromPriv, true);
//     };

//     for (let i = 0; i < 25; i++) {
//       for (let j = 0; j < addressIds.length; j++) {
//         let index = addressIds[j];
//         let result = await address.generate(i, index);

//         let node = HDKey.fromExtendedKey(masterPrivKey);
//         let child = node.derive(ethCfg.hdPath + `${i}` + '/' + index);
//         let publicKey = ethereumjs.importPublic(child.publicKey);
//         let addrFromPriv = '0x' + ethereumjs.pubToAddress(publicKey).toString('hex');

//         assert(result.address === addrFromPriv, true);
//       }
//     };
//   })

//   it('Should verify signature signed by the derive private key', async () => {
//     let accountIds = Array.from({length: NUMBER_OF_TEST_IDS}, () => Math.floor(Math.random() * 10000));
//     let addressIds = Array.from({length: NUMBER_OF_TEST_IDS}, () => Math.floor(Math.random() * 10000));
//     let address = addresses.ethereum;
//     for (let i = 0; i < accountIds.length; i++) {
//       let id = accountIds[i];
//       let result = await address.generate(id);
//       let pubNode = HDKey.fromExtendedKey(result.pubkey);

//       let node = HDKey.fromExtendedKey(masterPrivKey);
//       let privNode = node.derive(ethCfg.hdPath + `${id}`);

//       let hash = Buffer.alloc(32, 2);
//       let signature = privNode.sign(hash);
//       let verify = pubNode.verify(hash, signature);
//       assert(verify, true);
//     };

//     for (let i = 0; i < 25; i++) {
//       for (let j = 0; j < addressIds.length; j++) {
//         let index = addressIds[j];
//         let result = await address.generate(i, index);
//         let pubNode = HDKey.fromExtendedKey(result.pubkey);

//         let node = HDKey.fromExtendedKey(masterPrivKey);
//         let privNode = node.derive(ethCfg.hdPath + `${i}` + '/' + index);

//         let hash = Buffer.alloc(32, 2);
//         let signature = privNode.sign(hash);
//         let verify = pubNode.verify(hash, signature);
//         assert(verify, true);
//       }
//     };
//   })
// });
