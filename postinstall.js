const fs = require('fs-extra');

fs.removeSync('./node_modules/bitcoinforksjs-lib/node_modules/create-hash');
fs.removeSync('./node_modules/bitcoinjs-lib/node_modules/create-hash');
fs.removeSync('./node_modules/bitcoinjs-lib-pos/node_modules/create-hash');
fs.removeSync('./node_modules/bitcoinjs-lib-zcash/node_modules/create-hash');
fs.removeSync('./node_modules/bitgo-utxo-lib/node_modules/create-hash');