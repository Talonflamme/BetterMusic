import React from 'react';

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, setIsPlaying }) => {
    const onClick = () => {
        setIsPlaying(!isPlaying);
    }

    return (
        <button id="play-button" className="btn" onClick={onClick}>
            {
                isPlaying ?
                    // pause button
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                    </svg>
                    : // play button
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"></path>
                    </svg>
            }
        </button>
    )
};

interface PlayButtonProps {
    isPlaying: boolean,
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>
}

export default PlayButton;
