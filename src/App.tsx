import React, { useState } from 'react';
import MainContent from './components/content/MainContent';
import MusicPlayerContainer from './components/MusicPlayer/MusicPlayerContainer';
import { Song, SongContext } from './Song';
import './style.scss';


const sampleSong: Song = {
    title: 'Sleep Paralysis',
    artist: 'Juice WRLD',
    imagePath: '../assets/sleepparalysis.jpg',
    src: '../assets/SleepParalysis.mp3'
}

const App = () => {
    const [currentSong, setCurrentSong] = useState<Song>(sampleSong);

    return (
        <SongContext.Provider value={currentSong}>
            <MainContent />
            <MusicPlayerContainer />
        </SongContext.Provider>
    )
}

export default App;
