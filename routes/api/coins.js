module.exports = (api) => {
  api.getActiveCoins = () => {
    let nativeCoindList = [];
    let electrumCoinsList = [];
    let ethereumCoins = [];

    for (let key in api.electrumCoins) {
      if (key !== 'auth') {
        electrumCoinsList.push(key.toUpperCase());
      }
    }

    for (let key in api.coindInstanceRegistry) {
      nativeCoindList.push(key === 'komodod' ? 'KMD' : key);
    }

    for (let key in api.eth.coins) {
      ethereumCoins.push(key);
    }

    return {
      native: nativeCoindList,
      spv: electrumCoinsList,
      eth: ethereumCoins,
      total: nativeCoindList.length + electrumCoinsList.length + ethereumCoins.length,
      params: api.native.startParams,
    };
  };
  /*
   *  type: GET
   *
   */
  api.get('/InstantDEX/allcoins', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const retObj = api.getActiveCoins();

      res.end(JSON.stringify(retObj));
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