import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';

export async function convertToMP3(vidPath: string, coverPath: string, outputPath: string, title: string, artist: string): Promise<void> {
    console.log(ffmpegPath);
    return new Promise((resolve, reject) => {
        // convert video/audio to .mp3
        const ffmpegOutputProcess = spawn(ffmpegPath, [
            '-loglevel', 'error',  // show only errors, helpful for error message below
            '-i', vidPath,         // input file, .webm or any other audio/video format
            '-i', coverPath,       // second input file, .jpg or other image format
            '-map', '0:a',         // take only the audio channel from the input at index 0 (video/audio)
            '-map', '1',           // use cover from second input (index 1)
            '-c:a', 'libmp3lame',  // encode using LAME MP3 encoder (high quality, regarded as best encoder)
            '-id3v2_version', '3', // metadata
            '-metadata', `artist=${artist}`,
            '-metadata', `title=${title}`,
            '-metadata', `album=${title}`,
            '-y',                // overwrite output if it exists already
            outputPath
        ], { timeout: 60000 });

        let stderrOutput = "";
        ffmpegOutputProcess.stderr.on('data', (data: Buffer) => {
            stderrOutput += data.toString();
        });

        ffmpegOutputProcess.on('error', (err: Error) => {
            console.error(err);
            reject(err);
        });

        ffmpegOutputProcess.on('close', (code: number) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(stderrOutput));
            }
        });
    });
}
