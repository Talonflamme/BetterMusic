import React from 'react';
import PauseIcon from '../icons/PauseIcon';
import PlayIcon from '../icons/PlayIcon';

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, setIsPlaying }) => {
    const onClick = () => {
        setIsPlaying(!isPlaying);
    }

    return (
        <button id="play-button" className="btn" onClick={onClick}>
            {
                isPlaying ? <PauseIcon /> : <PlayIcon />
            }
        </button>
    )
};

interface PlayButtonProps {
    isPlaying: boolean,
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

export default PlayButton;
