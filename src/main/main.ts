import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { downloadVideo } from './ytdlp';
import log from 'electron-log/main';
import { convertToMP3 } from './ffmpeg';

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
            preload: path.join(__dirname, 'preload.js'),
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

ipcMain.handle('open-image-dialog', event => {
    return dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: "Image", extensions: ["jpg", "jpeg", "png", "gif"] }]
    });
});

ipcMain.handle('open-mp3-dialog', event => {
    return dialog.showSaveDialog({
        properties: ['showOverwriteConfirmation'],
        filters: [{ name: "MP3s", extensions: ["mp3"] }]
    });
});

ipcMain.handle('open-directory-dialog', event => {
    return dialog.showOpenDialog({
        properties: ['openDirectory']
    });
});

ipcMain.handle('download-yt', async (event, videoId: string, tempPath: string) => {
    return downloadVideo(videoId, tempPath);
});

ipcMain.handle('convert-to-mp3', async (event, ...args: Parameters<typeof convertToMP3>) => {
    return convertToMP3(...args);
});

// Set up the log file
log.initialize({ preload: false });
