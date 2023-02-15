import { YtVideo } from "./YouTubeSearch";
import fs from 'fs';
import path from 'path';
// import ffmpeg from 'fluent-ffmpeg';
import childProcess from 'child_process';

export async function downloadMP3(video: YtVideo, filepath: string, title: string, artist: string) {
    // const stream = await getHighestResolutionStream(video.vidId);
    // const tempPath = await createPath(stream.filetype);
    const tempPath = path.join(process.cwd(), "pfs6uq34.mp4");
    // await downloadVideo(stream, tempPath);
    try {
        await convertToMP3(tempPath, "C:\\Users\\pasca\\Downloads\\aries_pfp.jpg", filepath, "Glitter", "Aries");
    } finally {
        // delete temporary file
        // fs.unlink(tempPath, err => {
        //     throw err;
        // });
    }
}

async function convertToMP3(vidPath: string, coverPath: string, outputPath: string, title: string, artist: string): Promise<void> {
    console.log("Starting ffmepg!");
    // ffmpeg(vidPath)
    //     .on('error', (err, out, err_out) => {
    //         console.error(err_out);
    //     })
    //     .on("end", () => {
    //         console.log("Ended!!");
    //     })
    //     .input(coverPath)
    //     .outputOptions("-map", "0", "-map", "1", "-c", "copy")
    //     .outputOptions("-metadata", `title=${title}`, "-metadata", `artist=${artist}`, "-metadata", `album=${title}`, "-id3v2_version", "3")
    //     .output(outputPath)
    //     .run();
    // todo error in process; title and artist are empty above?
    outputPath = `C:\\Users\\pasca\\Downloads\\Glitter${Math.random()}.mp3`;
    childProcess.exec(`ffmpeg -i ${vidPath} -i ${coverPath} -map 0 -map 1 -c copy -metadata artist=${artist} -metadata title=${title} -id3v2_version 3 ${outputPath}`, { timeout: 5000 }, (err, out) => {
        if (err) {
            console.error(err);
        } else {
            console.log(out);
        }
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
            console.log("Written to: " + filePath);
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
    const bodyObj = { "context": { "client": { "clientName": "ANDROID", "clientVersion": "16.20" } } }; // also hardcoded
    const body = JSON.stringify(bodyObj);
    const response = await fetch(urlToFetch, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Accept-Language": "en-US,en",
            "Content-Length": body.length.toString()
        },
        body
    });
    const json: any = await response.json();
    const streamingData: StreamingData = json.streamingData; // todo sometimes undefined?

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

