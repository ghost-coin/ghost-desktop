# ghost-desktop – UI

![UI Preview](preview.gif)

> *"GHOST is a Proof of Stake privacy coin to help make you nothing but a "ghost" when transacting online!"*

We provide a decentralized privacy platform with a suite of tools to enhance your online privacy:

* **An anonymous cryptocurrency** – send and receive the GHOST cryptocurrency without revealing the transaction history
* **End-to-end encrypted messaging** – communicate in a secure and decentralized manner without revealing your IP address
<!-- * **A private marketplace** – buy and sell goods without leaving a trace -->

This repository is the user interface that works in combination with our [`ghost-core`](https://github.com/ghost-coin/ghost-core).

[![Download the packaged wallet for Mac, Windows and Linux](download-button.png)](https://github.com/ghost-coin/ghost-desktop/releases)

# Contribute

[![Snyk](https://snyk.io/test/github/ghost-coin/ghost-desktop/badge.svg)](https://snyk.io/test/github/ghost-coin/ghost-desktop)
[![Build Status](https://travis-ci.org/ghost-coin/ghost-desktop.svg?branch=master)](https://travis-ci.org/ghost-coin/ghost-desktop)
[![Coverage Status](https://coveralls.io/repos/github/ghost-coin/ghost-desktop/badge.svg?branch=master)](https://coveralls.io/github/ghost-coin/ghost-desktop?branch=master)
[![Code Climate](https://codeclimate.com/github/ghost-coin/ghost-desktop/badges/gpa.svg)](https://codeclimate.com/github/ghost-coin/ghost-desktop)
[![Greenkeeper badge](https://badges.greenkeeper.io/ghost-coin/ghost-desktop.svg)](https://greenkeeper.io/)

> Be sure to read our [Contributing Guidelines](CONTRIBUTING.md) first

## Development

### Boostrapping for development:

* Download + Install [Node.js®](https://nodejs.org/) 6.4—7.10
* Download + Install [git](https://git-scm.com/)

```bash
git clone https://github.com/ghost-coin/ghost-desktop
cd ghost-desktop
yarn install
```

### Development with Electron

(Optional) Make sure you are running a stable node verion, or use nvm to choose 12.16.3
1. [sudo] npm cache clean -f
2. [sudo] npm install -g n stable

1. run `ng serve` to start the dev server and keep it running
	* npm --depth 9999 update (possibly needed if step 1 produced error)
	* npm rebuild node-sass (possibly needed if step 1 produced error)
	* yarn install (possibly needed if step 1 produced error)
2. and then start it (in new terminal): `yarn run start:electron:dev`
	* note: this command will auto-refresh the client on each saved change
	* `--testnet` – for running on testnet (omit for running the client on mainnet)
	* `--devtools` – automatically opens Developer Tools on client launch

#### Interact with ghost-core daemon

You can directly interact with the daemon ran by the Electron version.

```
./ghost-cli -testnet getblockchaininfo
```

## Running

### Start Electron

* `yarn run start:electron:fast` – disables debug messages for faster startup (keep in mind using `:fast` disables auto-reload of app on code change)

### Package Electron

Building for Windows requires:
* WINE
* the 32-bit libraries to be available.

```bash
sudo apt-get install gcc-multilib
sudo apt-get install g++-multilib
```


* `yarn run package:win` – Windows
* `yarn run package:mac` – OSX
* `yarn run package:linux` – Linux

## Contributors

Join us in [#ghost-dev:matrix.org](https://riot.im/app/#/room/#ghost-dev:matrix.org) on [Riot](https://riot.im)
