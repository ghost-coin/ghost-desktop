declare const require: any;

export const environment = {
  production: false,
  releasesUrl: 'https://api.github.com/repos/ghost-coin/ghost-desktop/releases/latest',
  version: require('../../package.json').version,
  envName: 'docker1',
  ghostHost: 'localhost',
  ghostPort: 52925,
  marketVersion: 'UNKNOWN',
  marketHost: 'localhost',
  marketPort: 3100,
  isTesting: false
};
