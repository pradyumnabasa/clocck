const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow;

function createWindow(isScreensaver = false) {
  const windowConfig = {
    width: isScreensaver ? undefined : 1200,
    height: isScreensaver ? undefined : 800,
    fullscreen: isScreensaver,
    frame: !isScreensaver, // No frame in screensaver
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simplicity in this local app
    },
    backgroundColor: '#000000'
  };

  mainWindow = new BrowserWindow(windowConfig);
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  if (isScreensaver) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    
    // Screensaver exit handlers
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('screensaver-mode', true);
    });
  } else {
    // mainWindow.webContents.openDevTools();
  }

  // Handle IPC messages
  ipcMain.on('exit-screensaver', () => {
    if (isScreensaver) {
      app.quit();
    }
  });
}

app.whenReady().then(() => {
  // Parse command line arguments for Windows Screensaver
  const args = process.argv.slice(1);
  const screensaverArg = args.find(arg => arg.toLowerCase().startsWith('/s') || arg.toLowerCase().startsWith('-s'));
  const configArg = args.find(arg => arg.toLowerCase().startsWith('/c') || arg.toLowerCase().startsWith('-c'));
  const previewArg = args.find(arg => arg.toLowerCase().startsWith('/p') || arg.toLowerCase().startsWith('-p'));

  if (previewArg) {
    // /p <HWND> - preview mode. Electron doesn't support rendering as a child window natively easily.
    // For now, we will just quit in preview mode to avoid errors, or you can implement native addons.
    app.quit();
    return;
  } else if (configArg) {
    // /c - config mode. Show settings window (or main window).
    createWindow(false);
  } else if (screensaverArg) {
    // /s - screensaver mode.
    createWindow(true);
  } else {
    // Normal desktop mode
    createWindow(false);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(false);
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
