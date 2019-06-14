const passwdStrength = require('passwd-strength');
const {
  multisig,
  stringToWif,
} = require('agama-wallet-lib/src/keys');

module.exports = (api) => {
  /*
   *  type: GET
   *
   */
  api.get('/auth/status', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const _electrumCoins = JSON.parse(JSON.stringify(api.electrumCoins));
      let retObj;
      let _status = true;

      delete _electrumCoins.auth;

      if (!api.seed &&
          (Object.keys(_electrumCoins).length || Object.keys(api.eth.coins).length)) {
        _status = false;
      }

      retObj = {
        status: api.seed || Object.keys(api.coindInstanceRegistry).length ? 'unlocked' : 'locked',
        isPin: api.wallet.fname ? true : false,
        walletType: api.wallet.type ? api.wallet.type : null,
      };

      if (api.wallet.type === 'multisig') {
        const _keys = stringToWif(
          api.wallet.data.keys.seed,
          api.electrumJSNetworks.kmd,
          true
        );

        retObj.multisig = {
          redeemScript: api.wallet.data.sigData.redeemScript,
          redeemScriptDecoded: multisig.decodeRedeemScript(api.wallet.data.sigData.redeemScript),
          pubKey: _keys.pubHex,
        };
      }

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.checkToken = (token) => {
    if (token === api.appSessionHash ||
        process.argv.indexOf('devmode') > -1) {
      return true;
    }
  };

  api.checkStringEntropy = (str) => {
    // https://tools.ietf.org/html/rfc4086#page-35
    return passwdStrength(str) < 29 ? false : true;
  };

  api.isWatchOnly = () => {
    return api.argv && api.argv.watchonly === 'override' ? false : api._isWatchOnly;
  };

  return api;
};