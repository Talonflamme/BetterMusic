import React from 'react';

const DirectoryIcon: React.FC<DirectoryIconProps> = (props) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
    )
};

interface DirectoryIconProps extends React.SVGProps<SVGSVGElement> {

}

export default DirectoryIcon;
