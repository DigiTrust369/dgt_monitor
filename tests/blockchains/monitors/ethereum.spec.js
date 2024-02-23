require('module-alias/register');
const assert = require('assert');
const EthereumApi = require('@blockchains/apis/ethereum.api');
const EthereumMonitor = require('@blockchains/monitors/ethereum.monitor');
const redis = require('@config/redis');
const { ethereum } = require('@tests/blockchains/monitors/samples');
const { ethCfg } = require('@config/vars');
const { logger } = require('@config/logger');

describe('Ethereum Monitor Tests', () => {
  global.redis = redis;
  const address = '0xc7ec4d3a15522ad91d85997dd94e550ab6d49b55';
  let api = new EthereumApi();
  api.getTransactionReceipt = async (id) => {
    return {
      status: '0x1',
      gasUsed: '0x5208'
    }
  };
  let monitor = new EthereumMonitor(api);
  let consumer;
  let topics = [{
    topic             : 'crypto.deposits.' + Math.floor(Math.random() * Math.floor(1000000000)),
    partitions        : 1,
    replicationFactor : 1
  }, {
    topic             : 'crypto.withdrawals.' + Math.floor(Math.random() * Math.floor(1000000000)),
    partitions        : 1,
    replicationFactor : 1
  }];

  describe('Base class\'s method tests', () => {
    beforeEach(function () {
      redis.client.flushdb();
    });

    it('Should check if block is confirmed or not', () => {
      let height = 100, current = 203;
      assert.equal(monitor.isConfirmed(height, current), true);
      assert.equal(monitor.isConfirmed(height, current + ethCfg.minConfirmation), true);
    });

    it('Should return firstLaunched block if not block set', async () => {
      let block = await monitor.getProcessedBlock();
      assert.equal(block, ethCfg.firstLaunched);
    });

    it('Should set and get return same processed block', async () => {
      let height = 100;
      await monitor.setProcessedBlock(height);
      let block = await monitor.getProcessedBlock();
      assert.equal(height, block);
    });

    it('Should return only deposit for address has cached', async () => {
      await redis.hmset(ethCfg.name, { [address]: 'set' });
      let deposits = [{
         network     : 'ethereum',
         currency    : 'ETH',
         contract    : '',
         tx_hash     : '0x89c4c87bc09268221f61e446ff23a011563167e8f529b2ceb42b5dc0df5c05c6',
         amount      : '0x3e11fcdcc0026400',
         block       : 621919,
         address     : '0xa7d0483ef093f5f2791e875c6270fa94197f4b03',
         confirmed   : false,
         tag         : ''
       },{
         network     : 'ethereum',
         currency    : 'ETH',
         contract    : '',
         tx_hash     : '0x0f1bb573ac62ba5aaeb1b1fdf0c545cd87bae5348169a8d70551f6b0bbaba3df',
         amount      : '0xf207539952d0000',
         block       : 460109,
         address     : '0xc7ec4d3a15522ad91d85997dd94e550ab6d49b55',
         confirmed   : false,
         tag         : ''
       }];

        let filter = await monitor.filterDeposits(deposits);
        assert.deepEqual(filter, [deposits[1]]);
    });

    it('Should return only withdrawal for transaction hash has cached', async () => {
      await redis.hmset(ethCfg.name, { '0x0f1bb573ac62ba5aaeb1b1fdf0c545cd87bae5348169a8d70551f6b0bbaba3df': 'set' });
      let withdrawals = [{
         network     : 'ethereum',
         currency    : 'ETH',
         contract    : '',
         tx_hash     : '0x89c4c87bc09268221f61e446ff23a011563167e8f529b2ceb42b5dc0df5c05c6',
         block       : 621919,
         confirmed   : false
       },{
         network     : 'ethereum',
         currency    : 'ETH',
         contract    : '',
         tx_hash     : '0x0f1bb573ac62ba5aaeb1b1fdf0c545cd87bae5348169a8d70551f6b0bbaba3df',
         block       : 460109,
         confirmed   : false
       }];

        let filter = await monitor.filterWithdrawals(withdrawals);
        assert.deepEqual(filter, [withdrawals[1]]);
    });
  });

  describe('Class\'s method Tests', () => {
    it('Should convert block to transaction list', async () => {
      await redis.hmset(ethCfg.name, { [address]: 'set' });
      await redis.hmset(ethCfg.name, { '0x50f445133f7ba691774560959b0827719ef98d9dfc87235814492453595e723e': 'set' });
      let trxs = await monitor.blockToTrxs(ethereum.block.info);
      assert.deepEqual(trxs, ethereum.trxs);
    });

    it('Should convert transactions to deposits', async () => {
      let deposits = monitor.trxsToDeposits(ethereum.trxs);
      assert.deepEqual(deposits, ethereum.deposits);
    });

    it('Should convert transactions to withdrawals', async () => {
      let withdrawals = monitor.trxsToWithdrawals(ethereum.trxs);
      assert.deepEqual(withdrawals, ethereum.withdrawals);
    });
  });
});
