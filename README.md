# Agama Desktop App
Desktop App for SuperNET DAPPs

#### For Developers
You must have `node.js`, `npm` and `webpack` installed on your machine.

*Download the latest/current version of the Komodo Core (komodo daemon) for the operating system/s you are planning to build Agama for. You can find them here https://github.com/KomodoPlatform/komodo/releases.


1) Build & Start EasyDEX-GUI (frontend)
```shell
1) git clone https://github.com/komodoplatform/agama --recursive --branch master --single-branch
2) cd agama/gui/EasyDEX-GUI/react/
3) git checkout master && git pull origin master
4) npm update && npm install && npm install webpack
5) npm build && npm start (keep this terminal running when proceeding with part 2 "Start Agama App")
```

2) Start Agama App (electron)
```shell
1) cd agama
2) mv komodod and komodo-cli *binaries to assets/bin/OS_dir
3) npm update && npm install
4) npm start
5) et `dev: true` and `debug: true` in ~/.agama/config.json or execute `npm start devmode`
6) restart the app
```
You re ready to dev!

### Important dev notes

#### Sockets.io
In dev mode backend is configured to send/receive messages from/to http://127.0.0.1:3000 address. If you open it as http://localhost:3000 sockets server will reject any messages.

#### Coin daemon binaries
Run binary_artifacts.sh from under agama folder you cloned previously. The script will fetch

#### For end users
The instructions to make production build of Agama App will be updated soon.

To build the production ready app, install `electron-packager` and `electron-prebuilt` packages from npm
```shell
npm install electron-packager -g
npm install electron-prebuilt -g
```

#### **Build the Wallet-App**
You need to install webpack and webpack-cli first.

Refer to the original [electron-packager](https://github.com/electron-userland/electron-packager) repository for more detailed information.

##### Linux
Change directory to agama and execute the following command to build the Linux app
```shell
cd agama
electron-packager . --platform=linux --arch=x64 --icon=assets/icons/agama_icons/128x128.png --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/win64 --ignore=assets/bin/osx --overwrite
```
change architecture build parameter to ```--arch=x32``` for 32 bit build

##### OSX
Change directory to agama and execute the following command to build the OSX app
```shell
cd agama
electron-packager . --platform=darwin --arch=x64 --icon=assets/icons/agama_icons/agama_app_icon.icns --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/win64 --ignore=assets/bin/linux64 --overwrite
```

##### Windows
Change directory to agama and execute the following command to build the Windows app
```shell
dir agama
electron-packager . --platform=win32 --arch=x64 --icon=assets/icons/agama_icons/agama_app_icon.ico --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/osx --ignore=assets/bin/linux64 --overwrite

# If generating 32bit desktop package
electron-packager . --platform=win32 --arch=ia32 --icon=assets/icons/agama_icons/agama_app_icon.ico --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/osx --ignore=assets/bin/linux64 --overwrite

# To build both x64 and x86 desktop package
electron-packager . --platform=win32 --arch=all --icon=assets/icons/agama_icons/agama_app_icon.ico --out=build/ --buildVersion=VERSION_NUMBER_HERE --ignore=assets/bin/osx --ignore=assets/bin/linux64 --overwrite
```
change architecture build parameter to ```--arch=x64``` for 64 bit build


## Troubleshooting Instructions

### Windows DLL issues
On Windows it's noticed agama.exe complains about `VCRUNTIME140D.DLL` and `ucrtbased.dll` file.

Please see **windeps** directory and README file for instructions to install the required DLL files on Windows, and then try again running Agama App.

## Optional packages to make rpm and deb distros

electron-installer-debian

electron-installer-redhat

refer to ./make-deb.js and ./make-rpm.js
