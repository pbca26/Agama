const Promise = require('bluebird');
const request = require('request');
const nspvPorts = require('./nspvPorts');

module.exports = (api) => {
  api.nspvRequest = (coin, method, params) => {
    return new Promise((resolve, reject) => {
      const nspvServerUrl = `http://localhost:${nspvPorts[coin.toUpperCase()]}/`;
      const options = {
        url: nspvServerUrl,
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

      console.log(JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
      }));

      request(options, (error, response, body) => {
        console.log(body);
        resolve(JSON.parse(body));
      });
    });
  };

  return api;
};