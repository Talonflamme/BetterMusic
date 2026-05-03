import { YtVideo } from "./YouTubeSearch";
import fs from 'fs';
import _ffmpegPathFromStatic from 'ffmpeg-static';
import { Progress } from "./DownloadVideoWizard";
import { ipcRenderer } from "electron";
import { CropRectangle } from "./Crop";

type SetProgressFunction = (progress: Progress) => void;

export async function downloadMP3(video: YtVideo, imageSrc: string, crop: CropRectangle, filepath: string, title: string, artist: string, setDownloadProgress: SetProgressFunction, setConvertProgress: SetProgressFunction) {
    // let tempPath: string = path.join(os.tmpdir(), `${video.vidId}.%(ext)s`); // placeholder
    let tempPath: string = `${video.vidId}.%(ext)s`; // placeholder, gets resolved by yt-dlp

    setDownloadProgress("pending");

    ipcRenderer.send("create-abort-controller-for-download");

    let result: { abort: boolean, result?: any };

    // above pattern gets resolved and actual filepath returned
    try {
        result = await ipcRenderer.invoke("download-yt", video.vidId, tempPath);
    } catch (e) {
        console.error("Error download:", e);
        setDownloadProgress("error");
        throw e;
    }

    if (result.abort) {
        setDownloadProgress("abort");
        throw new DOMException("The operation was aborted 1", "AbortError");
    }

    tempPath = result.result;
    setDownloadProgress("success");
    setConvertProgress("pending");

    try {
        result = await ipcRenderer.invoke('convert-to-mp3', tempPath, imageSrc, crop, filepath, title, artist);
    } catch (e) {
        console.error("Error convert:", e);
        setConvertProgress("error");
        throw e;
    }

    if (result.abort) {
        setConvertProgress("abort");
        throw new DOMException("The operation was aborted 2", "AbortError");
    }

    setConvertProgress("success");
}
