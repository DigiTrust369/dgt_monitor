const fetch = require('node-fetch');
const { requestTimeout: timeout } = require('@config/vars');
const { resolve: urlResolve, parse: parseUrl } = require('url');
const { logger } = require('@config/logger');

class Api {
  constructor(config) {
    let urls;
    if (!config || !config.rpcUrls || config.rpcUrls.length <= 0) {
      logger.warn('nvalid rpc urls for blockchain');
      urls = 'http://127.0.0.1';
    }

    this.config = config;
    this.urls = (urls || config.rpcUrls).split(',');
    this.timeout = timeout || 5000;
    // May supports multiple urls in the future.
    this.base = parseUrl(this.urls[0]);
    if (this.base.auth) {
      this.base.authorization = `Basic ${Buffer.from(this.base.auth).toString('base64')}`;
    }
  }

  body (method, params) {
    return {
      jsonrpc   : "2.0",
      id        : "1",
      method    : method,
      params    : params
    };
  }

  validateRes (response) {
    if (response.error) {
      throw new Error(`RPC response error: ${response.error.message}`);
    }

    return response.result;
  }

  async get(path) {
    const url = this.config.rpcUrls + path;
    const headers = {
      'Authorization': this.base.authorization ? this.base.authorization : ''
    };

    const res = await fetch(url, { timeout: this.timeout, headers: headers });
    if (res.ok) { // res.status >= 200 && res.status < 300
      return res.json();
    }

    throw new Error(`Get request to ${url} return status ${res.status}, message: ${res.statusText}`);
  }

  async post(body, path) {
    const options = {
      method  : 'POST',
      body    : JSON.stringify(body),
      headers : {
        'Content-Type': 'application/json',
        'Authorization': this.base.authorization ? this.base.authorization : ''
      },
      timeout : timeout,
    };

    const url = this.config.rpcUrls + path;
    const res = await fetch(url, options);
    if (res.ok) { // res.status >= 200 && res.status < 300
      return res.json();
    }

    // bitcoin, litecoin, dash return message in body with statusCode is 500 not 200
    // parse this message for debug purpose
    let result  = await res.json();
    logger.warn(`Post request to ${url} return body ${JSON.stringify(result)}`);
    if (result && result.error && (result.error.message || result.error.what)) {
      logger.error(`Post request to ${url} return status ${res.status}, message: ${result.error.message || result.error.what}`);
      throw new Error(`RPC response error: ${result.error.message || result.error.what}`);
    }

    logger.error(`Post request to ${url} return status ${res.status}, message: ${res.statusText}`);
    throw new Error(`Post request to ${url} return status ${res.status}, message: ${res.statusText}`);
  }

  async request (method, params) {
    let body = this.body(method, params);
    let response = await this.post(body);
    return this.validateRes(response);
  }

  async importAddress (address) {
    return true;
  }

  async getHighestBlock () {
    return 0;
  }
}

module.exports = Api;
