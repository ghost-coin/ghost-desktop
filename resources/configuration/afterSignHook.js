const fs = require("fs");
const path = require("path");
var electronNotarize = require("electron-notarize");

require("dotenv").config();

module.exports = async (params) => {
  // Only notarize the app on Mac OS only.
  if (
    process.platform !== "darwin" ||
    params.electronPlatformName !== "darwin"
  ) {
    return;
  }
  console.log("afterSign hook triggered", params);

  // Same appId in electron-builder.
  let appId = "com.ombea-desktop-widget.app";

  let appPath = path.join(
    params.appOutDir,
    `${params.packager.appInfo.productFilename}.app`
  );
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electronNotarize.notarize({
      appBundleId: appId,
      appPath: appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
