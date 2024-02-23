// Crypto Environment helper
require('module-alias/register');
const { generateKeyPairSync } = require('crypto');
const bip32 = require('bip32');
const bip39 = require('bip39');
const base58check = require('bs58check');
const blakejs = require('blakejs');
const bitcore = require('bitcore-lib');
const coininfo = require('coininfo');
const ethereumjs = require("ethereumjs-util");
const HDKeyEth = require('hdkey');
const HDKeyNeo = require('@ont-community/hdkey-secp256r1');
const { default: Neon, wallet, tx, rpc } = require("@cityofzion/neon-js");
const RippleAPI = require('ripple-lib').RippleAPI;
const path = require('path');
const TronWeb = require('tronweb');
const tronWeb = new TronWeb({
  fullNode    : 'https://api.trongrid.io',
  solidityNode: 'https://api.trongrid.io'
});
require('dotenv').config();

// refer prefix from https://github.com/TezTech/eztz/blob/master/src/main.js
const tezosPrefix = {
  tz2 : Buffer.from(new Uint8Array([6, 161, 161])).toString('hex'),
  spsk: Buffer.from(new Uint8Array([17, 162, 224, 201])).toString('hex'),
  sppk: Buffer.from(new Uint8Array([3, 254, 226, 86])).toString('hex'),
};

const networkMode = process.env.NETWORK_MODE === 'mainnet' ? 'main' : 'test';
let environments = {
  masters: {
    pubkey: [],
    private: []
  },
  withdrawal: {
    address: [],
    private: []
  },
  centralize: {
    address: [],
    private: []
  }
};

function generate (blockhain, network) {
  const mnemonic = bip39.generateMnemonic();
  console.log(`${blockhain} Mnemonic: ${mnemonic}`);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let privNode = bip32.fromSeed(seed, network.toBitcoinJS());
  let pubNode = privNode.neutered();

  let publicKey = new bitcore.PublicKey(privNode.publicKey.toString('hex'));
  let address = new bitcore.Address(publicKey, bitcore.Networks.add(network.toBitcore()));

  // pubkey and privateKey return as base58  to import to bip32 and derive to child key
  // sign key return as hex, not network include, this key will be import to bitcore-lib
  // private key and sign the transaction
  return {
    address: address.toString(),
    pubkey: pubNode.toBase58(),
    sign: privNode.privateKey.toString('hex'),
    private: privNode.toBase58(),
    // for tezos
    publicKey: privNode.publicKey,
    privateKey: privNode.privateKey,
  }
}

function generateEvmNetwork () {
  const mnemonic = bip39.generateMnemonic();
  console.log(`Eth Mnemonic: ${mnemonic}`);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let node = HDKeyEth.fromMasterSeed(seed);
  let publicKey = ethereumjs.importPublic(node.publicKey);
  let address = '0x' + ethereumjs.pubToAddress(publicKey).toString('hex');

  return {
    address: address,
    pubkey: node.publicExtendedKey,
    private: node.privateExtendedKey,
    privateHex: node.privateKey.toString('hex')
  }
}

function generateBinance () {
  const mnemonic = bip39.generateMnemonic();
  console.log(`Binance Mnemonic: ${mnemonic}`);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let node = HDKeyEth.fromMasterSeed(seed);
  let publicKey = ethereumjs.importPublic(node.publicKey);
  let address = '0x' + ethereumjs.pubToAddress(publicKey).toString('hex');

  return {
    address: address,
    pubkey: node.publicExtendedKey,
    private: node.privateExtendedKey,
    privateHex: node.privateKey.toString('hex')
  }
}

function generateNeo () {
  const mnemonic = bip39.generateMnemonic();
  console.log(`Neo Mnemonic: ${mnemonic}`);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  let node = HDKeyNeo.fromMasterSeed(seed);
  let account = new wallet.Account(node.publicKey.toString('hex'));

  return {
    address: account.address,
    pubkey: node.publicExtendedKey,
    private: node.privateExtendedKey,
    privateHex: node.privateKey.toString('hex')
  }
}

/************ ADDRESS GENERATE ****************
 * Create master pubkey and private key for the address generator service
*/
{
  const api = new RippleAPI();
  let options = {
    test: networkMode === 'test' ? true : false
  };
  const address = api.generateAddress(options);
  environments.masters.pubkey.push('XRP_MASTER_ADDR=' + address.address);
  environments.withdrawal.address.push('XRP_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('XRP_WITHDRAWAL_PRIV=' + address.secret);
}

{
  let network = coininfo.bitcoin[networkMode].toBitcoinJS();
  let address = generate('Bitcoin', network);
  environments.masters.pubkey.push('BITCOIN_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('BITCOIN_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.bitcoincash[networkMode].toBitcoinJS();
  let address = generate('Bitcoin cash', network);
  environments.masters.pubkey.push('BITCOIN_ABC_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('BITCOIN_ABC_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.bitcoincash[networkMode].toBitcoinJS();
  let address = generate('Bitcoin SV', network);
  environments.masters.pubkey.push('BITCOIN_SV_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('BITCOIN_SV_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.litecoin[networkMode].toBitcoinJS();
  let address = generate('Litecoin', network);
  environments.masters.pubkey.push('LITECOIN_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('LITECOIN_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.dash[networkMode].toBitcoinJS();
  let address = generate('Dash', network);
  environments.masters.pubkey.push('DASH_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('DASH_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.bitcoin[networkMode].toBitcoinJS();
  let address = generate('Omni', network);
  environments.masters.pubkey.push('OMNI_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('OMNI_MASTER_PRIV_KEY=' + address.private);
}

{
  let address = generateEvmNetwork();
  environments.masters.pubkey.push('ETHEREUM_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('ETHEREUM_MASTER_PRIV_KEY=' + address.private);
}

{
  let address = generateBinance();
  environments.masters.pubkey.push('BINANCE_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('BINANCE_MASTER_PRIV_KEY=' + address.private);
}

{
  let address = generateNeo();
  environments.masters.pubkey.push('NEO_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('NEO_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.bitcoin['main'].toBitcoinJS();
  let address = generate('Tezos', network);
  environments.masters.pubkey.push('TEZOS_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('TEZOS_MASTER_PRIV_KEY=' + address.private);
}

{
  let network = coininfo.bitcoin['main'].toBitcoinJS();
  let address = generate('Tron', network);
  environments.masters.pubkey.push('TRON_MASTER_PUB_KEY=' + address.pubkey);
  environments.masters.private.push('TRON_MASTER_PRIV_KEY=' + address.private);
}

/************ WITHDRAWAL SERVICE ****************
 * Create withdrawal address and private key
*/
{
  let network = coininfo.bitcoin[networkMode].toBitcoinJS();
  let address = generate('Bitcoin', network);
  environments.withdrawal.address.push('BITCOIN_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('BITCOIN_WITHDRAWAL_PRIV=' + address.sign);
}

{
  let network = coininfo.bitcoincash[networkMode].toBitcoinJS();
  let address = generate('Bitcoin cash', network);
  environments.withdrawal.address.push('BITCOIN_ABC_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('BITCOIN_ABC_WITHDRAWAL_PRIV=' + address.sign);
}

{
  let network = coininfo.bitcoincash[networkMode].toBitcoinJS();
  let address = generate('Bitcoin SV', network);
  environments.withdrawal.address.push('BITCOIN_SV_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('BITCOIN_SV_WITHDRAWAL_PRIV=' + address.sign);
}

{
  let network = coininfo.litecoin[networkMode].toBitcoinJS();
  let address = generate('Litecoin', network);
  environments.withdrawal.address.push('LITECOIN_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('LITECOIN_WITHDRAWAL_PRIV=' + address.sign);
}

{
  let network = coininfo.dash[networkMode].toBitcoinJS();
  let address = generate('Dash', network);
  environments.withdrawal.address.push('DASH_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('DASH_WITHDRAWAL_PRIV=' + address.sign);
}

{
  let network = coininfo.bitcoin[networkMode].toBitcoinJS();
  let address = generate('Omni', network);
  environments.withdrawal.address.push('OMNI_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('OMNI_WITHDRAWAL_PRIV=' + address.sign);
}

{
  let address = generateEvmNetwork();
  environments.withdrawal.address.push('ETHEREUM_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('ETHEREUM_WITHDRAWAL_PRIV=' + address.privateHex);
}

{
  let address = generateBinance();
  environments.withdrawal.address.push('BINANCE_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('BINANCE_WITHDRAWAL_PRIV=' + address.privateHex);
}

{
  let address = generateNeo();
  environments.withdrawal.address.push('NEO_WITHDRAWAL_ADDR=' + address.address);
  environments.withdrawal.private.push('NEO_WITHDRAWAL_PRIV=' + address.privateHex);
}

{
  let network = coininfo.bitcoin['main'].toBitcoinJS();
  let address = generate('Tezos', network);
  let publicKeyHash = Buffer.from(blakejs.blake2b(address.publicKey, null, 20));
  let addr = base58check.encode(Buffer.from(tezosPrefix.tz2 + publicKeyHash.toString('hex'), "hex"));
  let privateKey = base58check.encode(Buffer.from(tezosPrefix.spsk + address.privateKey.toString('hex'), "hex"));

  environments.withdrawal.address.push('TEZOS_WITHDRAWAL_ADDR=' + addr);
  environments.withdrawal.private.push('TEZOS_WITHDRAWAL_PRIV=' + privateKey);
}

{
  let account = tronWeb.utils.accounts.generateAccount();
  environments.withdrawal.address.push('TRON_WITHDRAWAL_ADDR=' + account.address.base58);
  environments.withdrawal.private.push('TRON_WITHDRAWAL_PRIV=' + account.privateKey);
}


/************ CENTRALIZE SERVICE ****************
 * Create centralize address and private key
*/
{
  let network = coininfo.bitcoin[networkMode].toBitcoinJS();
  let address = generate('Bitcoin', network);
  environments.centralize.address.push('BITCOIN_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('BITCOIN_CENTRALIZE_PRIV=' + address.sign + ' | ' + address.private);
}

{
  let network = coininfo.bitcoincash[networkMode].toBitcoinJS();
  let address = generate('Bitcoin cash', network);
  environments.centralize.address.push('BITCOIN_ABC_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('BITCOIN_ABC_CENTRALIZE_PRIV=' + address.sign + ' | ' + address.private);
}

{
  let network = coininfo.bitcoincash[networkMode].toBitcoinJS();
  let address = generate('Bitcoin SV', network);
  environments.centralize.address.push('BITCOIN_SV_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('BITCOIN_SV_CENTRALIZE_PRIV=' + address.sign + ' | ' + address.private);
}

{
  let network = coininfo.litecoin[networkMode].toBitcoinJS();
  let address = generate('Litecoin', network);
  environments.centralize.address.push('LITECOIN_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('LITECOIN_CENTRALIZE_PRIV=' + address.sign + ' | ' + address.private);
}

{
  let network = coininfo.dash[networkMode].toBitcoinJS();
  let address = generate('Dash', network);
  environments.centralize.address.push('DASH_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('DASH_CENTRALIZE_PRIV=' + address.sign + ' | ' + address.private);
}

{
  let network = coininfo.bitcoin[networkMode].toBitcoinJS();
  let address = generate('Omni', network);
  environments.centralize.address.push('OMNI_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('OMNI_CENTRALIZE_PRIV=' + address.sign + ' | ' + address.private);
}

{
  let address = generateEvmNetwork();
  environments.centralize.address.push('ETHEREUM_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('ETHEREUM_CENTRALIZE_PRIV=' + address.privateHex + ' | ' + address.private);
}

{
  let address = generateBinance();
  environments.centralize.address.push('BINANCE_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('BINANCE_CENTRALIZE_PRIV=' + address.privateHex + ' | ' + address.private);
}

{
  let address = generateNeo();
  environments.centralize.address.push('NEO_CENTRALIZE_ADDR=' + address.address);
  environments.centralize.private.push('NEO_CENTRALIZE_PRIV=' + address.privateHex + ' | ' + address.private);
}

{
  let network = coininfo.bitcoin['main'].toBitcoinJS();
  let address = generate('Tezos', network);
  let publicKeyHash = Buffer.from(blakejs.blake2b(address.publicKey, null, 20));
  let addr = base58check.encode(Buffer.from(tezosPrefix.tz2 + publicKeyHash.toString('hex'), "hex"));
  let privateKey = base58check.encode(Buffer.from(tezosPrefix.spsk + address.privateKey.toString('hex'), "hex"));

  environments.centralize.address.push('TEZOS_CENTRALIZE_ADDR=' + addr);
  environments.centralize.private.push('TEZOS_CENTRALIZE_PRIV=' + privateKey);
}

{
  let account = tronWeb.utils.accounts.generateAccount();
  environments.centralize.address.push('TRON_CENTRALIZE_ADDR=' + account.address.base58);
  environments.centralize.private.push('TRON_CENTRALIZE_PRIV=' + account.privateKey);
}

// ======================================================

const crypto = require('crypto');
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
});

let pub = Buffer.from(publicKey).toString('hex');
let priv = Buffer.from(privateKey).toString('hex');
let encrypted = crypto.publicEncrypt(Buffer.from(pub, 'hex'), Buffer.from("hello"));
let decrypted = crypto.privateDecrypt(Buffer.from(priv, 'hex'), encrypted);

console.log(`\n############### ONLINE MODE ################
# run this command to auto generate env
#                 yarn env
#
############################################`)

console.log('# For blockchain address generator service - network: ' + networkMode);
environments.masters.pubkey.forEach((key) => {
  console.log(key)
});

console.log('\n# For withdrawal prepare service - network: ' + networkMode);
environments.withdrawal.address.forEach((key) => {
  console.log(key)
});

console.log('\n# For centralize prepare service - network: ' + networkMode);
environments.centralize.address.forEach((key) => {
  console.log(key)
});

console.log('\nRSA_PUB=' + pub);

console.log(`\n############### OFFLINE MODE ###############
# run this command to auto generate env
#                 yarn env
#
############################################`)
console.log('# For merge fund service - network: ' + networkMode);
environments.masters.private.forEach((key) => {
  console.log(key)
});

console.log('\n# For withdrawal transaction create service - network: ' + networkMode);
environments.withdrawal.private.forEach((key) => {
  console.log(key)
});

console.log('\n# Centralize address private key, keep them offline - network: ' + networkMode);
environments.centralize.private.forEach((key) => {
  console.log(key)
});

console.log('\nRSA_PRIV=' + priv);
