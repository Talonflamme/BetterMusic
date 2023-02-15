import React from 'react';

const PauseIcon: React.FC<PauseIconProps> = (props) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
        </svg>
    )
};

interface PauseIconProps extends React.SVGProps<SVGSVGElement> {

}

export default PauseIcon;
