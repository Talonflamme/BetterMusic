import React, { useRef } from 'react';
import Tooltip from '../../Tooltip';
import { ErrorLevel } from './SettingsPage';

const FileErrorDisplay: React.FC<FileErrorDisplayProps> = ({ errorLevel, errorMessage }) => {
    const tooltipParentRef = useRef<HTMLDivElement>();

    if (errorLevel === "none") return null;

    return (
        <div className="error-wrapper" ref={tooltipParentRef}>
            { /* Icon */}
            {
                errorLevel === "critical" ?
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="critical">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg >
                    :
                    <svg viewBox="0 0 36 36" fill="none">
                        <polygon points="18,4 34,32 2,32" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
                        <line x1="18" y1="14" x2="18" y2="22" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="18" cy="27" r="1.5" fill="#78350F" />
                    </svg>
            }
            { /* Tooltip */}
            <Tooltip parent={tooltipParentRef}>{errorMessage}</Tooltip>
        </div>
    )
};

interface FileErrorDisplayProps {
    errorLevel: ErrorLevel,
    errorMessage: string | null
}

export default FileErrorDisplay;
