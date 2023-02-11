import React, { useRef, useContext } from 'react';
import { SongContext, Song } from '../../Song'; 
import MusicPlayer from './MusicPlayer';

/**
 * Used to wrap the {@link MusicPlayer}. This component is necessary because the audio file is not getting re-rendered each second, which would lag the audio. Instead, only the {@link MusicPlayer} gets re-rendered and there is little to no lag.
 */
const MusicPlayerContainer: React.FC<AudioPlayerProps> = ({ }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const currentSong: Song = useContext(SongContext);
    
    return (<>
        <audio src={currentSong.src} ref={audioRef} />
        <MusicPlayer audioRef={audioRef} />
    </>)
}

interface AudioPlayerProps {

}

export default MusicPlayerContainer;
