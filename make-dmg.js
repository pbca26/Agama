// prequsites: https://www.npmjs.com/package/electron-installer-dmg

var installer = require('electron-installer-dmg');

var options = {
  appPath: 'build/Agama-darwin-x64/Agama.app',
  dest: 'build/',
  arch: 'amd64',
  icon: 'assets/icons/agama_icons/64x64.png',
  name: 'agama-app',
  bin: 'Agama',
  categories: ['Office', 'Internet'],
  homepage: 'https://komodoplatform.com',
  maintainer: 'Komodo Platform <support@komodoplatform.com>',
}

console.log('Creating package (this may take a while)');

installer(options, function (err) {
  if (err) {
    console.error(err, err.stack);
    process.exit(1);
  }

  console.log('Successfully created package at ' + options.dest);
});