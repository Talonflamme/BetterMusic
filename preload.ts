import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('YtDlp', {
    getYtDlpPath: (): Promise<string> => ipcRenderer.invoke("get-yt-dlp-path"),
    getYtDlpFilename: (): Promise<string> => ipcRenderer.invoke('get-yt-dlp-filename'),
})
