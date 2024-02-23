const WebSocket = require('ws');
const { Serialize } = require('eosjs');
const fetch = require('node-fetch');
const { TextDecoder, TextEncoder } = require('text-encoding');
const zlib = require('zlib');
const { logger } = require('@config/logger');

class Connection {
  constructor({ socketAddress, receivedAbi, receivedBlock }) {
    this.receivedAbi = receivedAbi;
    this.receivedBlock = receivedBlock;

    this.abi = null;
    this.types = null;
    this.blocksQueue = [];
    this.inProcessBlocks = false;

    this.ws = new WebSocket(socketAddress, { perMessageDeflate: false });
    this.ws.on('message', data => this.onMessage(data));
  }

  serialize(type, value) {
    const buffer = new Serialize.SerialBuffer({ textEncoder: new TextEncoder, textDecoder: new TextDecoder });
    Serialize.getType(this.types, type).serialize(buffer, value);
    return buffer.asUint8Array();
  }

  deserialize(type, array) {
    const buffer = new Serialize.SerialBuffer({ textEncoder: new TextEncoder, textDecoder: new TextDecoder, array });
    let result = Serialize.getType(this.types, type).deserialize(buffer, new Serialize.SerializerState({ bytesAsUint8Array: true }));
    if (buffer.readPos != array.length) {
      return;
    }

    return result;
  }

  toJsonUnpackTransaction(x) {
    return JSON.stringify(x, (k, v) => {
      if (k === 'trx' && Array.isArray(v) && v[0] === 'packed_transaction') {
        const pt = v[1];
        let packed_trx = pt.packed_trx;
        if (pt.compression === 0)
          packed_trx = this.deserialize('transaction', packed_trx);
        else if (pt.compression === 1)
          packed_trx = this.deserialize('transaction', zlib.unzipSync(packed_trx));
        return { ...pt, packed_trx };
      }
      if (k === 'packed_trx' && v instanceof Uint8Array)
        return this.deserialize('transaction', v);
      if (v instanceof Uint8Array)
        return Buffer.from(v).toString('hex');
      return v;
    }, 4)
  }

  send(request) {
    this.ws.send(this.serialize('request', request));
  }

  onMessage(data) {
    try {
      if (!this.abi) {
        this.abi = JSON.parse(data);
        this.types = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), this.abi);
        if (this.receivedAbi)
          this.receivedAbi();
      } else {
        const [type, response] = this.deserialize('result', data);
        this[type](response);
      }
    } catch (e) {
      logger.warn(`Parse eos message failed: ${e.message}`);
    }
  }

  requestBlocks(requestArgs) {
    this.send(['get_blocks_request_v0', {
      start_block_num: 0,
      end_block_num: 0xffffffff,
      max_messages_in_flight: 5,
      have_positions: [],
      irreversible_only: false,
      fetch_block: false,
      fetch_traces: false,
      fetch_deltas: false,
      ...requestArgs
    }]);
  }

  get_blocks_result_v0(response) {
    this.blocksQueue.push(response);
    this.processBlocks();
  }

  async processBlocks() {
    if (this.inProcessBlocks) return;
    this.inProcessBlocks = true;
    while (this.blocksQueue.length) {
      let response = this.blocksQueue.shift();
      this.send(['get_blocks_ack_request_v0', { num_messages: 1 }]);
      if (response.block && response.block.length) {
        let block = this.deserialize('signed_block', response.block);
        block.block_num = response.this_block.block_num;
        block.hash = response.this_block.block_id;
        let unPackedBlock = JSON.parse(this.toJsonUnpackTransaction(block));
        await this.receivedBlock(unPackedBlock);
      }
    }

    this.inProcessBlocks = false;
  }
} // Connection

module.exports = Connection;
