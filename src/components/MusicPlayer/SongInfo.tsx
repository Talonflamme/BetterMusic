import React, { useContext, useEffect, useState } from 'react';
import { SongContext } from '../../Song';
import { getImageFromMetadata } from '../../Files';
import * as mm from 'music-metadata-browser';
import fs from 'fs';


const SongInfo: React.FC<SongInfoProps> = ({ }) => {
    const { song } = useContext(SongContext);
    const [imageData, setImageData] = useState<string>(null);

    useEffect(() => {
        (async () => {
            try {
                await fs.promises.access(song.src); // check if file exists
                const metadata = await mm.fetchFromUrl(song.src);
                const pic = getImageFromMetadata(metadata)
                setImageData(pic);
            } catch (err) {
                // file not found
                setImageData(null);
            }
        })();
    }, [song.src]);

    return (
        <div className="song-info flex-center">
            <img src={imageData ?? "../assets/fnf.svg"} id="cover-image" />
            <div className="wrapper">
                <div className="title label">{song.title}</div>
                <div className="artist label">{song.artist}</div>
            </div>
        </div>
    )
};

interface SongInfoProps {

}

export default SongInfo;
