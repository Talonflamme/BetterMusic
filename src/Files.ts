import fs from 'fs';
import path from 'path';
import { Song } from './Song';
import * as mm from 'music-metadata-browser';


export async function getFiles() {
    const fileDirs = localStorage.getItem("fileDirs")?.split(",") ?? [];
    const lst: string[] = [];
    if (!fileDirs[0]) return [];
    try {
        const promises = fileDirs.map(async (dir) => {
            const files = await fs.promises.readdir(dir);
            return files.filter(x => x.endsWith(".mp3")).map(x => path.join(dir, x));
        });
        const files = (await Promise.all(promises)).flat(); // 2d array to 1d array
        return files;
    } catch (err) {
        console.error(err);
    }
    return lst;
}

export function getImageFromMetadata(metadata: mm.IAudioMetadata) {
    const img = metadata.common.picture && metadata.common.picture[0];

    return img && `data:${img.format};base64,${img.data.toString("base64")}` || null;
}

export async function convertFile(file: string): Promise<Song> {
    return new Promise(async (resolve, reject) => {
        try {
            const metadata = await mm.fetchFromUrl(file);

            const song: Song = {
                artist: metadata.common.artist || 'Unknown Artist',
                title: metadata.common.title || 'Unknown Title',
                src: file,
                imagePath: getImageFromMetadata(metadata) || "../assets/fnf.svg"
            };
            resolve(song);
        } catch (error) {
            reject(error);
        }
    });
}

export async function convertFiles(files: string[]): Promise<Song[]> {
    const promises: Promise<Song>[] = files.map(convertFile);
    return Promise.all(promises);
}
