import { YtVideo } from "./YouTubeSearch";
import fs from 'fs';
import path from 'path';
import _ffmpegPathFromStatic from 'ffmpeg-static';
import { spawn } from 'child_process';


const ffmpegPath = getFfmpeg(_ffmpegPathFromStatic);


export async function downloadMP3(video: YtVideo, imageSrc: string, filepath: string, title: string, artist: string) {
    const stream = await getHighestResolutionStream(video.vidId);
    const tempPath = await createPath(stream.filetype);
    await downloadVideo(stream, tempPath);
    try {
        await convertToMP3(tempPath, imageSrc, filepath, title, artist);
    } finally {
        // delete temporary file
        fs.unlink(tempPath, err => {
            if (err) {
                throw err;
            }
        });
    }
}

async function convertToMP3(vidPath: string, coverPath: string, outputPath: string, title: string, artist: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // convert .mp4 to .mp3
        const ffmpegInputProcess = spawn(ffmpegPath, [
            '-i', vidPath,
            '-vn', // disable video processing, only extract audio
            '-f', 'mp3', // mp3 output format
            '-' // send output to stdout
        ], { timeout: 10000 });
        // add cover and metadata to .mp3
        const ffmpegOutputProcess = spawn(ffmpegPath, [
            '-y', // overwrite existing file
            '-i', '-', // read input from stdin
            '-i', coverPath,
            '-map', '0', // map audio to output
            '-map', '1', // map image (cover) to output
            '-id3v2_version', '3',
            '-metadata', `artist=${artist}`,
            '-metadata', `title=${title}`,
            '-metadata', `album=${title}`,
            outputPath
        ], { timeout: 15000 });

        ffmpegInputProcess.stdout.pipe(ffmpegOutputProcess.stdin);

        ffmpegInputProcess.on('error', (err: Error) => {
            reject(err);
        });

        ffmpegOutputProcess.on('error', (err: Error) => {
            console.error(err);
            reject(err);
        });

        ffmpegOutputProcess.on('close', (code: number) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`ffmpeg exited with code ${code}`));
            }
        });
    });
}

async function downloadVideo(stream: ParsedFormat, filePath: string): Promise<void> {
    const res = await fetch(stream.url);
    const blob = await res.blob();
    return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        reader.onloadend = () => {
            if (reader.error) {
                reject(reader.error);
                return;
            }

            // @ts-expect-error
            const buffer = Buffer.from(reader.result);
            fs.writeFileSync(filePath, buffer);
            resolve();
        }
    });
}

async function createPath(filetype: string): Promise<string> {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let filePath = "";
    for (let i = 0; i < 8; i++) {
        filePath += chars.charAt(Math.floor(Math.random() * chars.length)); // select random char
    }
    filePath += `.${filetype}`;
    const fullPath = path.join(process.cwd(), filePath);
    try {

        await fs.promises.access(fullPath);
        return await createPath(filetype); // file already exists
    } catch (err) {
        return fullPath;
    }
}

async function getHighestResolutionStream(id: string): Promise<ParsedFormat> {
    const urlToFetch = `https://www.youtube.com/youtubei/v1/player?videoId=${id}&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&contentCheckOk=True&racyCheckOk=True`; // key is hard coded
    const bodyObj = {'context': {'client': {'androidSdkVersion': 30, 'clientName': 'ANDROID_MUSIC', 'clientVersion': '5.16.51'}}}; // also hardcoded
    const body = JSON.stringify(bodyObj);
    const response = await fetch(urlToFetch, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "'com.google.android.apps.youtube.music/'",
            "Accept-Language": "en-US,en",
            "Content-Length": body.length.toString()
        },
        body
    });
    const json: any = await response.json();
    const streamingData: StreamingData = json.streamingData;

    const formats: Format[] = (streamingData.adaptiveFormats ?? []); // this includes video/audio and both
    formats.push(...(streamingData.formats ?? []));
    let parsedFormats = formats.map(parseFormat);
    parsedFormats = parsedFormats.filter(hasAudio); // only formats with audio

    const ABRs = parsedFormats.map(x => ({ format: x, abr: itags[x.itag] ?? x.averageBitrate }));
    const best = ABRs.reduce((a, b) => a.abr >= b.abr ? a : b).format;
    return best;
}

function parseFormat(format: Format): ParsedFormat {
    let mime = format.mimeType;
    let codecsString: string;
    [mime, codecsString] = mime.split(";");
    const [type, subtype] = mime.trim().split("/"); // eg.: 'video/webm; codecs="vp9"' -> 'video/webm' -> ['video', 'webm']
    const codecs = codecsString.split(",").map(x => x.trim());

    const isAdaptive = codecs.length % 2;
    return {
        track: isAdaptive ? (type as any) : "both",
        filetype: subtype,
        url: format.url,
        averageBitrate: format.averageBitrate,
        itag: format.itag
    }
}

function getFfmpeg(path: string): string {
    return path.replace(/\.asar/gi, ".asar.unpacked")
}

/**
 * Streams have audio if they are not adaptive or if they are audio
 */
function hasAudio(format: ParsedFormat): boolean {
    return format.track !== "video";
}

type Format = { url: string, mimeType: string, averageBitrate: number, itag: number };
type ParsedFormat = { url: string, filetype: string, averageBitrate: number, track: "audio" | "video" | "both", itag: number };
type StreamingData = { expiresInSeconds: string, adaptiveFormats?: Format[], formats?: Format[] };


/**
 * List of itags with their respective average bitrate (in bps).
 */
const itags = {
    5: 64_000,
    6: 64_000,
    13: 0,
    17: 24_000,
    18: 96_000,
    22: 192_000,
    34: 128_000,
    35: 128_000,
    36: 0,
    37: 192_000,
    38: 192_000,
    43: 128_000,
    44: 128_000,
    45: 192_000,
    46: 192_000,
    59: 128_000,
    78: 128_000,
    82: 128_000,
    83: 128_000,
    84: 192_000,
    85: 192_000,
    91: 48_000,
    92: 48_000,
    93: 128_000,
    94: 128_000,
    95: 256_000,
    96: 256_000,
    100: 128_000,
    101: 192_000,
    102: 192_000,
    132: 48_000,
    151: 24_000,
    300: 128_000,
    301: 128_000
}

