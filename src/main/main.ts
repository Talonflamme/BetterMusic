import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import { downloadVideo } from './ytdlp';
import log from 'electron-log/main';
import { convertToMP3 } from './ffmpeg';
import fs from 'fs';

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

ipcMain.on('show-file-in-folder', (event, filePath: string) => {
    shell.showItemInFolder(filePath);
});

type DropLast<T extends unknown[]> = Required<T> extends [...infer Head, unknown] ? Head : never;

let downloadAbortController: AbortController | null = null;

ipcMain.on('create-abort-controller-for-download', () => {
    downloadAbortController = new AbortController();
});

ipcMain.on('abort-download', () => {
    if (!downloadAbortController) {
        console.error("Tried to abort, but controller is null");
    } else {
        downloadAbortController.abort();
    }
});

/** Files that still need to be deleted. Emptied out by deleting all files upon main receiving a 'cleanup' ipc message */
export const filesToBeDeleted: string[] = [];

export function cleanup() {
    filesToBeDeleted.forEach(file => {
        try {
            fs.unlinkSync(file);
        } catch (e) {
            console.error("Error on cleanup:", e);
        }
    });
    // clear array
    filesToBeDeleted.length = 0;
}

ipcMain.handle('download-yt', async (event, ...args: DropLast<Parameters<typeof downloadVideo>>) => {
    if (!downloadAbortController) {
        console.warn("Abortion controller is not set, but `downloadVideo(...)` was called");
    }
    
    try {
        const res = await downloadVideo(...args, downloadAbortController?.signal);
        return { abort: false, result: res };
    } catch (e) {
        if (e.name === "AbortError") return { abort: true }; // expected error, swallow it silently
        throw e;
    }
});

ipcMain.handle('convert-to-mp3', async (event, ...args: DropLast<Parameters<typeof convertToMP3>>) => {
    if (!downloadAbortController) {
        console.warn("Abortion controller is not set, but `convertToMP3(...)` was called");
    }

    try {
        const res = await convertToMP3(...args, downloadAbortController?.signal);
        return { abort: false, result: res };
    } catch (e) {
        if (e.name === "AbortError") return { abort: true }; // expected error, swallow it silently
        throw e;
    };
});

// Set up the log file
log.initialize({ preload: false });
