import _ffmpegPathFromStatic from 'ffmpeg-static';
import { spawn } from 'child_process';
import { CropRectangle } from '../renderer/components/content/DownloadPage/Crop';
import fs from 'fs';
import { cleanup } from './main';

const ffmpegPath = getFfmpegPath(_ffmpegPathFromStatic);

function getCropFilter({ left, top, right, bottom }: CropRectangle): string {
    // Construct the crop filter
    // Args are: width:height:x:y  (all relative to top-left corner in absolute pixels)
    // Built in variables are: iw = input width, ih = input height
    // we apply this to the video stream, so iw and ih are the dimensions of the cover Image
    // Since the argument `crop` gives the values for left, top, right, bottom in percentages and relative to the edges (like the css inset property), we need to convert these values to the absolute pixel values, we use the ffmpeg expression evaluator for that:

    const width = `iw*(1-${right}-${left})`; // w = (1 - right - left) * iw          (since right is relative to the right edge, not the left)
    const height = `ih*(1-${bottom}-${top})`;// h = (1 - bottom - top) * ih
    const x = `iw*${left}`;                  // x = left * iw
    const y = `ih*${top}`;                   // y = top * ih

    return `crop=round(${width}):round(${height}):round(${x}):round(${y})`;
}

export async function convertToMP3(vidPath: string, coverPath: string, crop: CropRectangle, outputPath: string, title: string, artist: string, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {

        const cropFilter = getCropFilter(crop);
        let processError: Error | null = null;

        // convert video/audio to .mp3
        const ffmpegOutputProcess = spawn(ffmpegPath, [
            '-loglevel', 'error',    // show only errors, helpful for error message below
            '-i', vidPath,           // input file, .webm or any other audio/video format
            '-i', coverPath,         // second input file, .jpg or other image format
            '-map', '0:a',           // take only the audio channel from the input at index 0 (video/audio)
            '-map', '1',             // use cover from second input (index 1)
            '-filter:v', cropFilter, // apply a filter to the video stream (=cover art) and crop the image to a region
            '-c:a', 'libmp3lame',    // encode using LAME MP3 encoder (high quality, regarded as best encoder)
            '-id3v2_version', '3',   // metadata
            '-metadata', `artist=${artist}`,
            '-metadata', `title=${title}`,
            '-metadata', `album=${title}`,
            '-y',                    // overwrite output if it exists already
            outputPath
        ], {
            timeout: 60000,
            signal
        });

        let stderr = "";

        ffmpegOutputProcess.stderr.on('data', data => stderr += data);
        ffmpegOutputProcess.on('error', e => {
            // store the error but wait for process to close (to make files free again)
            processError = e;
            reject(e);
        });

        // 'close' is always called, even after 'error'
        ffmpegOutputProcess.on('close', (code: number) => {
            if (processError) {
                reject(processError);
                fs.unlink(outputPath, err => { if (err) console.error(err) });
            } else if (code === 0) {
                // vidPath is already added by yt-dlp.ts, output must not be cleaned up, so no need to add anything to `filesToBeDeleted`
                resolve(); 
            }
            else {
                reject(new Error(stderr));
                fs.unlink(outputPath, err => { if (err) console.error(err) });
            }

            // no matter if the process was successful, canceled or failed, we need to cleanup the temporary video path either way
            cleanup();
        });
    });
}

function getFfmpegPath(path: string): string {
    return path.replace(/\.asar/gi, ".asar.unpacked")
}
