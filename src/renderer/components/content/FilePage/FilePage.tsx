import React from 'react';
import { convertFiles, getFiles } from '../../../Files';
import { Song } from '../../../Song';
import useAsyncState from '../../../useAsyncState';
import NoFiles from './NoFiles';
import SongCard from './SongCard';

const FilePage: React.FC<FilePageProps> = ({ toggleState, ...props }) => {
    const [songs] = useAsyncState(async () => {
        const s: Song[] = await upgradeSongs(songs ?? []);
        s.sort((a, b) => a.title.localeCompare(b.title));
        return s;
    }, [toggleState], []); // get songs and sort alphabetically

    return (
        <div id="songs" className="scrollable" {...props}>
            {songs.map(song => <SongCard key={song.src} song={song} />)}
            {songs.length ? null : <NoFiles />}
        </div>
    )
};

async function upgradeSongs(songs: Song[]): Promise<Song[]> {
    const files = await getFiles(); // file locations for files
    const oldSongs: Song[] = songs.filter(song => files.includes(song.src));
    const sources = new Set(songs.map(x => x.src));
    const missingSources = files.filter(x => !sources.has(x));
    const newSongs = await convertFiles(missingSources);
    return oldSongs.concat(newSongs);
}

interface FilePageProps {
    toggleState: boolean
}

export default FilePage;
