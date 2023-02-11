import React from 'react';

const ContentTab: React.FC<ContentTabProps> = ({ id, currentTab, children }) => {
    return (
        id === currentTab &&
        <div>
            {children}
        </div>
    )
};

interface ContentTabProps {
    id: number,
    currentTab: number,
    children?: React.ReactNode
}

export default ContentTab;
