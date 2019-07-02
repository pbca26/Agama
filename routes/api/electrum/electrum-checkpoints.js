const {
  parseBlock,
  electrumMerkleRoot,
} = require('agama-wallet-lib/src/block');
const btcnetworks = require('agama-wallet-lib/src/bitcoinjs-networks');
const fs = require('fs');

const bits_to_target = (bits) => {
  const bitsN = (bits >> 24) & 0xff;
  
  if (!(bitsN >= 0x03 && bitsN <= 0x20)) {
    console.log("First part of bits should be in [0x03, 0x1f]");
  }
  
  const bitsBase = bits & 0xffffff;

  if (!(bitsBase >= 0x8000 && bitsBase <= 0x7fffff)) {
    console.log("Second part of bits should be in [0x8000, 0x7fffff]")
  }

  return bitsBase << (8 * (bitsN-3));
}

const blockCount = 1425067; 
let checkpoints = [];
let i = 2015;
let INTERVAL = 2016;
let run = true;

module.exports = (api) => {
  api.get('/electrum/checkpoints', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      (async function() {
        const network = req.query.network || api.findNetworkObj(req.query.coin);
        const ecl = await api.ecl(network);
        ecl.connect();
        
        while (run) {  
          api.log(`electrum blockchainBlockGetHeader ${i} =>`, 'spv.checkpoints');
          
          await ecl.blockchainBlockGetHeader(i)
          .then((json) => {
            const blockInfo = parseBlock(json, btcnetworks[network] || btcnetworks.kmd);
            
            checkpoints.push([
              0,
              bits_to_target(blockInfo.bits),
              [[i, json]]
            ]);

            i += INTERVAL;
            if (i > blockCount) {
              run = false;
              console.log('checkpoints done');
              fs.writeFileSync('checkpoints.json', JSON.stringify(checkpoints), 'utf8');
            }
          });
        }
      })();
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