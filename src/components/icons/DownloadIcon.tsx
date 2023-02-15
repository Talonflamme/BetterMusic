import React from 'react';

const DownloadIcon: React.FC<DownloadIconProps> = (props) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
        </svg>
    )
};

interface DownloadIconProps extends React.SVGProps<SVGSVGElement> {

}

export default DownloadIcon;
