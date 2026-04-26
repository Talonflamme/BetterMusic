import { ipcRenderer } from 'electron';
import fs from 'fs';
import { promisify } from 'util';
import { execFile } from 'child_process';

const execFileAsync = promisify(execFile);

export async function isYtDlpInstalled(): Promise<boolean> {
    return fs.existsSync(await window.YtDlp.getYtDlpPath());
}

export async function installFirstYtDlp(): Promise<void> {
    await ipcRenderer.invoke("download-yt-dlp");
}

export async function updateYtDlp(): Promise<void> {
    await execFileAsync(await window.YtDlp.getYtDlpPath(), ["-U"]);
}
