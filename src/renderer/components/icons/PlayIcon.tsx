import React from 'react';

const PlayIcon: React.FC<PlayIconProps> = (props) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M8 5v14l11-7z"></path>
        </svg>
    )
};

interface PlayIconProps extends React.SVGProps<SVGSVGElement> {

}

export default PlayIcon;
