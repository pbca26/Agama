const electron = require('electron');
const express = require('express');
const app = electron.app;
let api = express.Router();

api.setconf = require('../private/setconf.js');
api.nativeCoind = require('./nativeCoind.js');
api.nativeCoindList = {};
api.assetChainPorts = require('./ports.js');
api.assetChainPortsDefault = require('./ports.js');
api._appConfig = require('./appConfig.js');

api.coindInstanceRegistry = {};
api.coindStdout = {};
api.guiLog = {};
api.rpcConf = {};
api.appRuntimeLog = [];
api.lockDownAddCoin = false;
api._isWatchOnly = false;

// dex cache
api.mmupass = null;
api.mmRatesInterval = null;
api.mmPublic = {
  coins: [],
  mmupass: null,
  swaps: [],
  bids: [],
  asks: [],
  isAuth: false,
  rates: {},
  prices: [],
  coinsHelper: {},
  stats: [],
  electrumServersList: {},
};

// spv vars and libs
api.electrumCoins = {
  auth: false,
};
api.electrumKeys = {};
api.electrumCache = {};

api.electrumJSCore = require('./electrumjs/electrumjs.core.js');
api.electrumJSNetworks = require('./electrumjs/electrumjs.networks.js');
const {
  electrumServers,
  electrumServersFlag,
} = require('./electrumjs/electrumServers.js');
api.electrumServers = electrumServers;
api.electrumServersFlag = electrumServersFlag;
api.electrumServersV1_4 = {};

api.CONNECTION_ERROR_OR_INCOMPLETE_DATA = 'connection error or incomplete data';

api.appConfig = api._appConfig.config;

// core
api = require('./api/paths.js')(api);

api.pathsAgama();

// core
api = require('./api/log.js')(api);
api = require('./api/config.js')(api);

api.appConfig = api.loadLocalConfig();

api.pathsDaemons();

api.appConfigSchema = api._appConfig.schema;
api.defaultAppConfig = Object.assign({}, api.appConfig);
api.kmdMainPassiveMode = false;
api.native = {
  startParams: {},
};
api.seed = null;

// spv
api = require('./api/electrum/network.js')(api);
api = require('./api/electrum/coins.js')(api);
api = require('./api/electrum/keys.js')(api);
api = require('./api/electrum/auth.js')(api);
api = require('./api/electrum/merkle.js')(api);
api = require('./api/electrum/balance.js')(api);
api = require('./api/electrum/transactions.js')(api);
api = require('./api/electrum/parseTxAddresses.js')(api);
api = require('./api/electrum/decodeRawtx.js')(api);
api = require('./api/electrum/block.js')(api);
api = require('./api/electrum/createtx.js')(api);
api = require('./api/electrum/createtx-split.js')(api);
api = require('./api/electrum/createtx-multi.js')(api);
api = require('./api/electrum/interest.js')(api);
api = require('./api/electrum/listunspent.js')(api);
api = require('./api/electrum/estimate.js')(api);
api = require('./api/electrum/btcFees.js')(api);
api = require('./api/electrum/insight.js')(api);
api = require('./api/electrum/cache.js')(api);
api = require('./api/electrum/proxy.js')(api);
api = require('./api/electrum/servers.js')(api);
api = require('./api/electrum/csv.js')(api);
api = require('./api/electrum/utils.js')(api);

// dex
/*api = require('./api/dex/coind.js')(api);
api = require('./api/dex/mmControl.js')(api);
api = require('./api/dex/mmRequest.js')(api);
api = require('./api/dex/electrumServersList.js')(api);*/

// core
api = require('./api/addCoinShortcuts.js')(api);
api = require('./api/dashboardUpdate.js')(api);
api = require('./api/binsUtils.js')(api);
api = require('./api/downloadUtil.js')(api);
api = require('./api/init.js')(api);
api = require('./api/pin.js')(api);
api = require('./api/downloadBins.js')(api);
api = require('./api/downloadPatch.js')(api);
api = require('./api/downloadZcparams.js')(api);
api = require('./api/coinsList.js')(api);
api = require('./api/quitDaemon.js')(api);
api = require('./api/rpc.js')(api);
api = require('./api/kickstart.js')(api);
api = require('./api/debugLog.js')(api);
api = require('./api/confMaxconnections.js')(api);
api = require('./api/appInfo.js')(api);
api = require('./api/daemonControl.js')(api);
api = require('./api/auth.js')(api);
api = require('./api/coins.js')(api);
api = require('./api/coindWalletKeys.js')(api);
api = require('./api/addressBook.js')(api);
api = require('./api/dice.js')(api);

// elections
api = require('./api/elections.js')(api);

// explorer
// api = require('./api/explorer/overview.js')(api);

// kv
api = require('./api/kv.js')(api);

// eth
api.eth = {
  coins: {},
  connect: {},
  gasPrice: {},
  tokenInfo: {},
  abi: {},
};
api = require('./api/eth/auth.js')(api);
api = require('./api/eth/keys.js')(api);
api = require('./api/eth/network.js')(api);
api = require('./api/eth/balance.js')(api);
api = require('./api/eth/transactions.js')(api);
api = require('./api/eth/coins.js')(api);
api = require('./api/eth/gasPrice.js')(api);
api = require('./api/eth/createtx.js')(api);
api = require('./api/eth/utils.js')(api);

// exchanges
api.exchangesCache = {
  coinswitch: {},
};
api = require('./api/exchange/exchange')(api);
api = require('./api/exchange/coinswitch/coinswitch')(api);
api = require('./api/exchange/changelly/changelly')(api);
api.loadLocalExchangesCache();

api.printDirs();

// default route
api.get('/', (req, res, next) => {
  res.send('Agama app server2');
});

// expose sockets obj
api.setIO = (io) => {
  api.io = io;
};

api.setVar = (_name, _body) => {
  api[_name] = _body;
};

// spv
if (((api.appConfig.dev || process.argv.indexOf('devmode') > -1) && api.appConfig.spv.cache) ||
    (!api.appConfig.dev && process.argv.indexOf('devmode') === -1)) {
  api.loadLocalSPVCache();
}

if (api.appConfig.spv &&
    api.appConfig.spv.customServers) {
  api.loadElectrumServersList();
} else {
  api.mergeLocalKvElectrumServers();
}

api.checkCoinConfigIntegrity();

if (api.appConfig.loadCoinsFromStorage) {
  api.loadCoinsListFromFile();
}

module.exports = api;