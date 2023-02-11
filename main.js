const { app, BrowserWindow } = require('electron');
const React = require('react');
const ReactDOM = require('react-dom');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load index.html
  win.loadFile('public/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// electronReload(__dirname, {
//   electron: require(`${__dirname}/node_modules/electron`),
//   watch: ["public/index.html"]
// });
