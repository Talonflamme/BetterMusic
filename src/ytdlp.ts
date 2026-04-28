import { app } from 'electron';
import fs from 'fs';
import https from 'https';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const DOWNLOAD_BASE_URL = "https://github.com/yt-dlp/yt-dlp/releases/latest/download";

/**
 * Stolen from ytdlp-nodejs :)
 */
const PLATFORM_MAPPINGS: Record<string, Record<string, string>> = {
    win32: {
        x64: 'yt-dlp.exe',
        ia32: 'yt-dlp_x86.exe',
    },
    linux: {
        x64: 'yt-dlp',
        armv7l: 'yt-dlp_linux_armv7l',
        aarch64: 'yt-dlp_linux_aarch64',
        arm64: 'yt-dlp',
    },
    darwin: {
        x64: 'yt-dlp_macos',
        arm64: 'yt-dlp_macos',
    },
    android: {
        arm64: 'yt-dlp',
    },
};

const YT_DLP_DIR = app.getPath("userData");
const YT_DLP_PATH = path.join(YT_DLP_DIR, getBuildFilename());

function getBuildFilename(): string {
    const arch = process.arch as string;
    const platform = process.platform as string;

    if (!PLATFORM_MAPPINGS[platform] || !PLATFORM_MAPPINGS[platform][arch]) {
        throw new Error(`No yt-dlp build available for ${platform} ${arch}`);
    }

    return PLATFORM_MAPPINGS[platform][arch];
}

async function downloadFile(url: string, outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        https.get(url, response => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(outPath);

                file.on('finish', () => file.close(() => resolve()));
                file.on('error', err => {
                    file.close(() => {
                        fs.promises.unlink(outPath).then(() => reject(err));
                    });
                });

                response.pipe(file);
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, outPath).then(resolve).catch(reject);
            } else {
                reject(`Server responded with code: ${response.statusCode}`);
            }
        }).on('error', err => {
            reject(err.message);
        });
    });
}

async function downloadYtDlpBuild() {
    const filename = getBuildFilename();
    const downloadUrl = `${DOWNLOAD_BASE_URL}/${filename}`;

    console.log(`Downloading yt-dlp from ${downloadUrl}...`);

    if (!fs.existsSync(YT_DLP_DIR)) {
        fs.mkdirSync(YT_DLP_DIR, { recursive: true });
    }

    await downloadFile(downloadUrl, YT_DLP_PATH);

    console.log(`Downloaded yt-dlp to: ${YT_DLP_PATH}`);
}

export async function downloadVideo(videoId: string, outputPath: string) {
    if (!fs.existsSync(YT_DLP_PATH)) {
        await downloadYtDlpBuild();
    }

    const path = (await execFileAsync(YT_DLP_PATH, [
        `https://www.youtube.com/watch?v=${videoId}`,
        "-U", // update to newest version
        "-f", "bestaudio", // format with best audio quality
        "-o", outputPath, // output path, patterns like `%(ext)s` gets resolved and replaced and returned
        "--no-warnings",
        "--print", "after_move:filename" // prints the resoled filename after stream is actually downloaded and file is ready
    ])).stdout.trim();

    return path;
}