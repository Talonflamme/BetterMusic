import { useMemo } from 'react';
import fs from 'fs';
import path from 'path';
import { Song } from './Song';
import * as mm from 'music-metadata-browser';


const fileDirs = localStorage.getItem("fileDirs")?.split(",") ?? [];

export function useFiles() {
    const files = useMemo(() => {
        const lst: string[] = [];
        try {
            fileDirs.forEach(dir => {
                const read = fs.readdirSync(dir).filter(x => x.endsWith(".mp3")).map(x => path.join(dir, x));
                lst.push(...read);
            })
        } catch (err) {
            console.error(err);
        }
        return lst;
    }, [fileDirs]);

    return files;
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
        } catch(error) {
            reject(error);
        }
    });
}

export async function convertFiles(files: string[]): Promise<Song[]> {
    const promises: Promise<Song>[] = files.map(convertFile);
    return Promise.all(promises);
}
