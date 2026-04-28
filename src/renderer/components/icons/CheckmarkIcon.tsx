import React from 'react';

const CheckmarkIcon: React.FC<CheckmarkIconProps> = (props) => {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
        </svg>
    )
};

interface CheckmarkIconProps extends React.SVGProps<SVGSVGElement> {

}

export default CheckmarkIcon;
