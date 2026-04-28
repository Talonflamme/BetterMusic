import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import log from 'electron-log';

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        },
        icon: path.join(__dirname, "public/favicon.ico")
    });
    win.maximize();
    win.setMenuBarVisibility(!app.isPackaged);

    // Load index.html
    win.loadFile(path.join(__dirname, 'public/index.html'));
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

ipcMain.handle('download-yt', (event) => {
    console.log("Hello World from main");
    return true;
});

// Set up the log file
log.initialize({ preload: true });
