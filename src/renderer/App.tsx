import React, { useState } from 'react';
import MainContent from './components/content/MainContent';
import MusicPlayerContainer from './components/MusicPlayer/MusicPlayerContainer';
import { Song, SongContext, NULL_SONG } from './Song';
import { convertFile } from './Files';
import useAsyncState from './useAsyncState';
import fs from 'fs';


const App = () => {
    const [currentSongPlaying, setCurrentSongPlaying] = useState(false);

    const [song, setSong] = useAsyncState<Song>(async () => {
        const currentSong = localStorage.getItem("current-song");
        if (!currentSong) return NULL_SONG;

        try {
            await fs.promises.access(currentSong);
            return await convertFile(currentSong);
        } catch (err) {
            return NULL_SONG;
        }
    }, [], NULL_SONG);

    const setCurrentSong = (s: Song) => {
        setSong(s);
        localStorage.setItem("current-song", s.src);
    }

    return (
        <SongContext.Provider value={{
            song, setSong: setCurrentSong,
            isPlaying: currentSongPlaying, setIsPlaying: setCurrentSongPlaying
        }}>
            <MainContent />
            <MusicPlayerContainer />
        </SongContext.Provider>
    )
}

export default App;
