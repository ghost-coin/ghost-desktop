declare const require: any;

export const environment = {
  production: true,
  version: require('../../package.json').version,
  releasesUrl: 'https://api.github.com/repos/ghost-coin/ghost-desktop/releases/latest',
  envName: 'prod',
//  marketVersion: require('../../node_modules/ghost-marketplace/package.json').version,
  marketVersion: 'UNKNOWN',
  ghostHost: 'localhost',
  ghostPort: 51925,
  marketHost: 'localhost',
  marketPort: 3000,
  isTesting: false
};
