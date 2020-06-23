# ghost-desktop – UI

> *"GHOST is a Proof of Stake privacy coin to help make you nothing but a "ghost" when transacting online!"*

We provide a decentralized privacy platform with a suite of tools to enhance your online privacy:

* **An anonymous cryptocurrency** – send and receive the GHOST cryptocurrency without revealing the transaction history
* **End-to-end encrypted messaging** – communicate in a secure and decentralized manner without revealing your IP address

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

* Download + Install [Yarn](https://classic.yarnpkg.com/en/docs/install)
* Download + Install [Node.js®](https://nodejs.org/) 8.12.0 - ?
* Download + Install [git](https://git-scm.com/)

```bash
git clone https://github.com/ghost-coin/ghost-desktop
cd ghost-desktop
yarn install
```

### Development with Electron

1. run `ng serve` to start the dev server and keep it running
2. and then start it: `yarn run start:electron:dev`
   * note: this command will auto-refresh the client on each saved change
   * `-testnet` – for running on testnet (omit for running the client on mainnet)
   * `-opendevtools` – automatically opens Developer Tools on client launch
   * `-skipmarket` – skip launching internal market process

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

Join us in [ghostcoinchat](https://t.me/ghostcoinbymcafee) on Telegram
