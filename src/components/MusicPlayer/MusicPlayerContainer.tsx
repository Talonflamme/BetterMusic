import React, { useRef, useContext } from 'react';
import { SongContext } from '../../Song';
import MusicPlayer from './MusicPlayer';

/**
 * Used to wrap the {@link MusicPlayer}. This component is necessary because the audio file is not getting re-rendered each second, which would lag the audio. Instead, only the {@link MusicPlayer} gets re-rendered and there is little to no lag.
 */
const MusicPlayerContainer: React.FC<AudioPlayerProps> = ({ }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const { song } = useContext(SongContext);

    return (<>
        <audio src={song.src} ref={audioRef} />
        <MusicPlayer audioRef={audioRef} song={song} />
    </>)
}

interface AudioPlayerProps {

}

export default MusicPlayerContainer;
