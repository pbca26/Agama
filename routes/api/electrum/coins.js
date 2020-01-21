const { getRandomIntInclusive } = require('agama-wallet-lib/src/utils');
const { spawn } = require('child_process');
const fs = require('fs');
const nspvPorts = require('./nspvPorts');

module.exports = (api) => {
  api.findCoinName = (network) => {
    for (let key in api.electrumServers) {
      if (key.toLowerCase() === network.toLowerCase()) {
        return key;
      }
    }
  }

  api.addElectrumCoin = (coin, enableNspv) => {
    coin = coin.toLowerCase();
    const servers = api.electrumServers[coin].serverList;
    // select random server
    let randomServer;

    if (enableNspv &&
        nspvPorts[coin.toUpperCase()]) {
      api.log(`start ${coin.toUpperCase()} in NSPV at port ${nspvPorts[coin.toUpperCase()]}`, 'spv.coin');
      fs.writeFileSync(`${api.agamaDir}/params`, coin.toUpperCase() === 'KMD' ? '' : coin.toUpperCase(), 'utf8');

      const nspv = spawn(`${api.komodocliDir}/nspv`, {
        cwd: api.agamaDir,
      }, []);

      nspv.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
      
      nspv.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
      
      nspv.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
      });

      randomServer = {
        ip: 'localhost',
        port: nspvPorts[coin.toUpperCase()],
        proto: 'http',
      };
      api.electrumServers[coin].serverList = 'none';
      api.nspvProcesses[coin] = {
        process: nspv,
        pid: nspv.pid,
      };
      
      api.log(`${coin.toUpperCase()} NSPV daemon PID ${nspv.pid}`, 'spv.coin');      
    } else {
      // pick a random server to communicate with
      if (servers &&
          servers.length > 0) {
        const _randomServerId = getRandomIntInclusive(0, servers.length - 1);
        const _randomServer = servers[_randomServerId];
        const _serverDetails = _randomServer.split(':');

        if (_serverDetails.length === 3) {
          randomServer = {
            ip: _serverDetails[0],
            port: _serverDetails[1],
            proto: _serverDetails[2],
          };
        }
      }
    }

    api.electrumCoins[coin] = {
      name: coin,
      server: {
        ip: randomServer.ip,
        port: randomServer.port,
        proto: randomServer.proto,
      },
      serverList: api.electrumServers[coin].serverList ? api.electrumServers[coin].serverList : 'none',
      txfee: coin === 'btc' ? 'calculated' :api.electrumServers[coin].txfee,
    };

    if (enableNspv) api.electrumCoins[coin].nspv = true;

    if (randomServer) {
      api.log(`random ${coin} electrum server ${randomServer.ip + ':' + randomServer.port}`, 'spv.coin');
    } else {
      api.log(`${coin} doesnt have any backup electrum servers`, 'spv.coin');
    }

    if (Object.keys(api.electrumKeys).length > 0) {
      const _keys = api.wifToWif(api.electrumKeys[Object.keys(api.electrumKeys)[0]].priv, coin);

      api.electrumKeys[coin] = {
        priv: _keys.priv,
        pub: _keys.pub,
      };

    } else if (api.seed) {
      api.auth(api.seed, true);
    }

    return true;
  }

  api.get('/electrum/coin/changepub', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      api.electrumKeys[req.query.coin].pub = req.query.pub;

      const retObj = {
        msg: 'success',
        result: 'true',
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.get('/electrum/coins/add', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const result = api.addElectrumCoin(req.query.coin, req.query.nspv);

      const retObj = {
        msg: 'success',
        result,
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.get('/electrum/coins', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      let _electrumCoins = JSON.parse(JSON.stringify(api.electrumCoins)); // deep cloning

      for (let key in _electrumCoins) {
        if (api.electrumKeys[key]) {
          _electrumCoins[key].pub = api.electrumKeys[key].pub;
          _electrumCoins[key].name = key.toUpperCase();
          _electrumCoins[key].pubHex = api.electrumKeys[key].pubHex;
          _electrumCoins[key.toUpperCase()] = JSON.parse(JSON.stringify(_electrumCoins[key]));
          delete _electrumCoins[key];
        }
      }

      const retObj = {
        msg: 'success',
        result: _electrumCoins,
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.checkCoinConfigIntegrity = (coin) => {
    let _totalCoins = 0;

    for (let key in api.electrumJSNetworks) {
      if (!api.electrumServers[key] ||
          (api.electrumServers[key] && !api.electrumServers[key].serverList)) {
        api.log(`disable ${key}, coin config check not passed`, 'spv.coin');
        delete api.electrumServers[key];
        delete api.electrumServersFlag[key];
      } else {
        _totalCoins++;
      }
    }

    api.log(`total supported spv coins ${_totalCoins}`, 'spv.coin');
  };

  return api;
};