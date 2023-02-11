import React, { useContext, useEffect, useState } from 'react';
import { SongContext, Song } from '../../Song';
import * as mm from 'music-metadata-browser';
import ima from '../../../assets/fnf.svg';


const SongInfo: React.FC<SongInfoProps> = ({ }) => {
    const song: Song = useContext(SongContext);
    const [imageData, setImageData] = useState<string>(null);

    useEffect(() => {
        // fetch metadata from file using music-metadata-browser
        mm.fetchFromUrl(song.src).then(metadata => {
            const pic = metadata.common.picture[0];
            if (pic !== undefined) {
                const base64 = `data:${pic.format};base64,${pic.data.toString("base64")}`;
                setImageData(base64);
            }
        });
    }, [song.src]);

    return (
        <div id="song-info" className="flex-center">
            <img src={imageData ?? ima} id="cover-image" />
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
