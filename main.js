const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const log = require('electron-log');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: !app.isPackaged
        },
        icon: path.join(__dirname, "favicon.ico")
    });
    win.maximize();
    win.setMenuBarVisibility(!app.isPackaged);

    // Load index.html
    win.loadFile('public/index.html');
}

app.whenReady().then(() => {
    createWindow();
});

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

ipcMain.on('open-image-dialog', event => {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: "Image", extensions: ["jpg", "jpeg", "png", "gif"] }]
    }).then(files => {
        event.sender.send('selected-image-dialog', files);
    });
});

ipcMain.on('open-mp3-dialog', event => {
    dialog.showSaveDialog({
        properties: ['showOverwriteConfirmation'],
        filters: [{ name: "MP3s", extensions: ["mp3"] }]
    }).then(files => {
        event.sender.send('selected-mp3-dialog', files);
    });
});

ipcMain.on('open-directory-dialog', event => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }).then(files => {
        event.sender.send('selected-directory-dialog', files);
    });
});

if (!app.isPackaged) {
    const electronReload = require('electron-reload');
    electronReload(__dirname, {
        // electron: require(`${__dirname}/node_modules/electron`),
        watch: ["public/index.html", "dist"]
    });
}

// Set up the log file
log.initialize({ preload: true });
