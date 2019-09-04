const fs = require('fs-extra');
const nativePorts = require('../ports');
const erc20Contracts = require('agama-wallet-lib/src/eth/eth-erc20-contract-id');
const modeToValueReversed = {
  '0': 'spv',
  '-1': 'native',
  '3': 'eth',
};

module.exports = (api) => {
  api.fsCoinsListFilterOutDisabledCoins = (coinsList) => {
    const coinsCheckList = {
      native: nativePorts,
      spv: api.electrumServersFlag,
      eth: erc20Contracts,
    };
    let coins = {};
    
    if (coinsList[0] &&
        coinsList[0].hasOwnProperty('selectedCoin')) { // convert old version to new version
      for (let i = 0; i < coinsList.length; i++) {
        let params = {};

        if (Number(coinsList[i].mode) === -1 &&
            coinsList[i].daemonParam) {
          params.daemonParam = coinsList[i].daemonParam;
        }

        if (Number(coinsList[i].mode) === -1 &&
            coinsList[i].genProcLimit) {
          params.genProcLimit = coinsList[i].genProcLimit;
        }

        coins[coinsList[i].selectedCoin] = {
          coin: {
            value: coinsList[i].selectedCoin,
          },
          params: Object.keys(params).length ? params : null,
          mode: modeToValueReversed[coinsList[i].mode],
        };
      }

      coinsList = coins;
    }

    for (let key in coinsList) {
      if (coinsList[key].mode === 'spv' ||
          coinsList[key].mode === 'native') {
        if (!coinsCheckList[coinsList[key].mode][coinsList[key].mode === 'spv' ? coinsList[key].coin.value.split('|')[0].toLowerCase() : coinsList[key].coin.value.split('|')[0].toUpperCase()]) {
          api.log(`disable ${coinsList[key].coin.value.split('|')[0].toUpperCase()} in ${coinsList[key].mode} mode`, 'fs.coins.load');
          delete coinsList[key];
        }
      } else {
        if (coinsList[key].coin.value !== 'ETH' &&
            coinsList[key].coin.value !== 'ETH_ROPSTEN' &&
            !coinsCheckList[coinsList[key].mode][coinsList[key].coin.value.split('|')[1].toUpperCase()]) {
          api.log(`disable ${coinsList[key].coin.value.split('|')[1].toUpperCase()} in ${coinsList[key].mode} mode`, 'fs.coins.load');
          delete coinsList[key];
        }
      }
    }

    return coinsList;
  };

  api.loadCoinsListFromFile = () => {
    try {
      if (fs.existsSync(`${api.agamaDir}/shepherd/coinslist.json`)) {
        let _coinsList = JSON.parse(fs.readFileSync(`${api.agamaDir}/shepherd/coinslist.json`, 'utf8'));
        _coinsList = api.fsCoinsListFilterOutDisabledCoins(_coinsList);

        let isLite = false;
        let isNative = false;

        for (let key in _coinsList) {
          if (_coinsList[key].mode === 'spv' ||
              _coinsList[key].mode === 'eth') {
            isLite = true;
          } else {
            isNative = true;
          }
        }

        if ((isLite && !isNative) || (!isLite && isNative)) {
          for (let key in _coinsList) {
            if (_coinsList[key].mode === 'spv') {
              const _coin = _coinsList[key].coin.value.split('|')[0];

              api.addElectrumCoin(_coin);
              api.log(`add spv coin ${_coin} from file`, 'spv.fs.coins');
            } else if (_coinsList[key].mode === 'eth') {
              const _coin = _coinsList[key].coin.value === 'ETH' ? 'ETH' : _coinsList[key].coin.value.split('|')[1];

              api.ethAddCoin(_coin);
              api.log(`add eth coin ${_coin} from file`, 'eth.fs.coins');
            } else if (_coinsList[key].mode === 'native') {
              const _coin = _coinsList[key].coin.value.split('|')[0];

              api.log(`add native coin ${_coin} from file`, 'native.fs.coins');
              api.startKMDNative(_coin);
            }
          }
        } else {
          api.log('concurrent native and lite mode coins are not allowed', 'fs.coins');
        }
      }
    } catch (e) {
      api.log(e, 'fs.coins');
    }
  }

  /*
   *  type: GET
   *
   */
  api.get('/coinslist', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      if (fs.existsSync(`${api.agamaDir}/shepherd/coinslist.json`)) {
        fs.readFile(`${api.agamaDir}/shepherd/coinslist.json`, 'utf8', (err, data) => {
          if (err) {
            const retObj = {
              msg: 'error',
              result: err,
            };

            res.end(JSON.stringify(retObj));
          } else {
            const retObj = {
              msg: 'success',
              result: data ? api.fsCoinsListFilterOutDisabledCoins(JSON.parse(data)) : '',
            };

            res.end(JSON.stringify(retObj));
          }
        });
      } else {
        const retObj = {
          msg: 'error',
          result: 'coin list doesn\'t exist',
        };

        res.end(JSON.stringify(retObj));
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  /*
   *  type: POST
   *  params: payload
   */
  api.post('/coinslist', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const _payload = req.body.payload;

      if (!_payload) {
        const retObj = {
          msg: 'error',
          result: 'no payload provided',
        };

        res.end(JSON.stringify(retObj));
      } else {
        fs.writeFile(`${api.agamaDir}/shepherd/coinslist.json`, JSON.stringify(_payload), (err) => {
          if (err) {
            const retObj = {
              msg: 'error',
              result: err,
            };

            res.end(JSON.stringify(retObj));
          } else {
            const retObj = {
              msg: 'success',
              result: 'done',
            };

            res.end(JSON.stringify(retObj));
          }
        });
      }
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};