import React from 'react';

const AbortIcon: React.FC<AbortIconProps> = (props) => {
    return (
        <svg viewBox="-2 -2 28 28" {...props} fill="none" stroke="currentColor" strokeWidth="2" >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
    )
};

interface AbortIconProps extends React.SVGProps<SVGSVGElement> {
}

export default AbortIcon;
