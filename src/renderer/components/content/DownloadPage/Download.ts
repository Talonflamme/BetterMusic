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

    // above pattern gets resolved and actual filepath returned
    try {
        tempPath = await ipcRenderer.invoke("download-yt", video.vidId, tempPath);
        setDownloadProgress("success");
    } catch (e) {
        console.error("Error download:", e);
        fs.unlink(tempPath, err => { });
        setDownloadProgress("error");
        throw e;
    }

    setConvertProgress("pending");

    try {
        await ipcRenderer.invoke('convert-to-mp3', tempPath, imageSrc, crop, filepath, title, artist);
        setConvertProgress("success");
    } catch (e) {
        console.error("Error convert:", e);
        setConvertProgress("error");
        throw e;
    } finally {
        // delete temporary file
        fs.unlink(tempPath, err => {
            if (err) {
                throw err;
            }
        });
    }
}
