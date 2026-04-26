const { app, BrowserWindow, ipcMain, dialog, contextBridge } = require('electron');
const path = require('path');
const log = require('electron-log');

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            devTools: true,
            preload: path.join(__dirname, "dist", "preload.js"),
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

ipcMain.handle('download-yt-dlp', async () => {
    const filename = getYtDlpFilename();
    const url = `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${filename}`;

    const resp = await fetch(url);
    const buffer = await resp.arrayBuffer();

    await fs.promises.writeFile(YT_DLP_PATH, Buffer.from(buffer));

    // make executable on mac/linux
    if (process.platform !== "win32") {
        await fs.promises.chmod(YT_DLP_PATH, 0o755);
    }
});

if (!app.isPackaged) {
    const electronReload = require('electron-reload');
    electronReload(path.join(__dirname, "**", "!(*temp_*)")); // don't include temporary files
}

// Set up the log file
log.initialize({ preload: true });

// handle yt-dlp requests
function getYtDlpFilename() {
    switch (process.platform) {
        case "win32": return "yt-dlp.exe";
        case "darwin": return "yt-dlp_macos";
        default: return "yt-dlp";
    }
}

const YT_DLP_PATH = path.join(app.getPath('userData'), getYtDlpFilename());

ipcMain.handle("get-yt-dlp-filename", getYtDlpFilename);
ipcMain.handle("get-yt-dlp-path", () => YT_DLP_PATH);
