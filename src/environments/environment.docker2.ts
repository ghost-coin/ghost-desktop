declare const require: any;

export const environment = {
  production: false,
  releasesUrl: 'https://api.github.com/repos/ghost-coin/ghost-desktop/releases/latest',
  version: require('../../package.json').version,
  envName: 'docker2',
  ghostHost: 'localhost',
  ghostPort: 53925,
  marketVersion: 'UNKNOWN',
  marketHost: 'localhost',
  marketPort: 3200,
  isTesting: false
};
