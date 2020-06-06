// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
declare const require: any;

export const environment = {
  production: true,
  envName: 'test',
  releasesUrl: 'https://api.github.com/repos/ghost-coin/ghost-desktop/releases/latest',
  version: require('../../package.json').version,
//  marketVersion: require('../../node_modules/ghost-marketplace/package.json').version,
  marketVersion: 'UNKNOWN',
  ghostHost: 'localhost',
  ghostPort: 51925,
  marketHost: 'localhost',
  marketPort: 3000,
  isTesting: true
};
