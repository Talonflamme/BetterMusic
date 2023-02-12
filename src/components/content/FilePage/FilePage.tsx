import React from 'react';
import { useFiles, convertFiles } from '../../../Files';
import useAsyncEffect from '../../../useAsyncState';
import SongCard from './SongCard';

const FilePage: React.FC<FilePageProps> = ({ style }) => {
    const files = useFiles();
    const [songs] = useAsyncEffect(async () => {
        const songs = await convertFiles(files);
        songs.sort((a, b) => a.title.localeCompare(b.title));
        return songs;
    }, [files], []); // get songs and sort alphabetically

    return (
        <div id="songs" className="scrollable" style={style}>
            {songs.map(song => <SongCard key={song.src} song={song} />)}
        </div>
    )
};

interface FilePageProps {
    style?: React.CSSProperties
}

export default FilePage;
