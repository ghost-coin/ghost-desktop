const electron      = require('electron');
const app           = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path          = require('path');
const fs            = require('fs');
const url           = require('url');
const platform      = require('os').platform();
const daemonConfig = require('./modules/daemon/daemonConfig');
const options = daemonConfig.getConfiguration();
/* correct appName and userData to respect Linux standards */
if (process.platform === 'linux') {
  app.setName('ghost-desktop');
  app.setPath('userData', `${app.getPath('appData')}/${app.getName()}`);
}



// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let closeDaemonWindow;
let tray;


exports.initCloseWindow = () => {
  electron.Menu.setApplicationMenu(null);
  // Create the browser window.
  closeDaemonWindow = new BrowserWindow({
    // width: on Win, the width of app is few px smaller than it should be
    // (this triggers smaller breakpoints) - this size should cause
    // the same layout results on all OSes
    // minWidth/minHeight: both need to be specified or none will work
    width:     670,
    minWidth:  670,
    height:    675,
    minHeight: 675,
    icon:      path.join(__dirname, 'resources/icon.png'),
    
    titleBarStyle: 'hidden',
    frame: true,
    darkTheme: true,

    webPreferences: {
      backgroundThrottling: false,
      webviewTag: false,
      nodeIntegration: false,
      sandbox: true,
      contextIsolation: false,
    },
  });

  // Hide the menu bar, press ALT
  // to show it again.
  closeDaemonWindow.setMenuBarVisibility(false);
  closeDaemonWindow.setAutoHideMenuBar(true);


  // and load the index.html of the app.
  if (options.dev) {
    closeDaemonWindow.loadURL('http://localhost:4200/assets/closingWindow/closingWindowDev.html');
  } else {
    closeDaemonWindow.loadURL(url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist/assets/closingWindow/closingWindow.html'),
      slashes: true
    }));
  }

  // Open the DevTools.
  if (options.devtools) {
    closeDaemonWindow.webContents.openDevTools()
  }



  // Emitted when the window is closed.
  closeDaemonWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    closeDaemonWindow = null
  });
}
