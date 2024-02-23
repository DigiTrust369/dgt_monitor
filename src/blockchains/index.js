const addresses = require('require-all')({
  dirname     :  __dirname + '/addresses',
  filter      :  /(.+address)\.js$/,
  map         : (name, path) => {
    return name.replace('.address', '');
  }
});

const apis = require('require-all')({
  dirname     :  __dirname + '/apis',
  filter      :  /(.+api)\.js$/,
  map         : (name, path) => {
    return name.replace('.api', '');
  },
  resolve     : function (Controller) {
    return new Controller();
  }
});

const monitors = require('require-all')({
  dirname     :  __dirname + '/monitors',
  filter      :  /(.+monitor)\.js$/,
  map         : (name, path) => {
    return name.replace('.monitor', '');
  },
  resolve     : function (Controller) {
    return new Controller(apis[Controller.network]);
  }
});

const funds = require('require-all')({
  dirname     :  __dirname + '/funds',
  filter      :  /(.+fund)\.js$/,
  map         : (name, path) => {
    return name.replace('.fund', '');
  },
  resolve     : function (Controller) {
    return new Controller(apis[Controller.network]);
  }
});

const transactions = require('require-all')({
  dirname     :  __dirname + '/transactions',
  filter      :  /(.+transaction)\.js$/,
  map         : (name, path) => {
    return name.replace('.transaction', '');
  },
  resolve     : function (Controller) {
    return new Controller(apis[Controller.network]);
  }
});

module.exports = {
  addresses   : addresses,
  monitors    : monitors,
  funds       : funds,
  transactions: transactions,
  apis        : apis
}
