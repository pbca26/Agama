const Promise = require('bluebird');
const request = require('request');
const nspvPorts = require('./nspvPorts');

module.exports = (api) => {
  api.nspvRequest = (coin, method, params) => {
    return new Promise((resolve, reject) => {
      const options = {
        url: `http://localhost:${nspvPorts[coin.toUpperCase()]}/`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method,
          params,
        }),
      };

      api.log(JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
      }), 'spv.nspv.req');

      request(options, (error, response, body) => {
        api.log(body, 'spv.nspv.req');
        resolve(JSON.parse(body));
      });
    });
  };

  api.stopNSPVDaemon = (coin) => {
    if (coin === 'all') {
      for (let key in api.electrumCoins) {
        if (api.electrumCoins[key].nspv &&
            api.nspvProcesses[key].pid) {
          api.log(`NSPV daemon ${key.toUpperCase()} PID ${api.nspvProcesses[key].pid} is stopped`, 'spv.nspv.coin');
          api.nspvProcesses[key].process.kill('SIGHUP');
          delete api.nspvProcesses[key];
        }
      }
    } else {
      if (api.electrumCoins[coin].nspv &&
          api.nspvProcesses[coin].pid) {
        api.log(`NSPV daemon ${coin.toUpperCase()} PID ${api.nspvProcesses[coin].pid} is stopped`, 'spv.nspv.coin');
        api.nspvProcesses[coin].process.kill('SIGHUP');
        delete api.nspvProcesses[coin];
      }
    }
  };

  return api;
};