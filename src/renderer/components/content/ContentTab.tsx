import React, { useEffect, useState } from 'react';
import { TabId } from './MainContent';

const ContentTab: React.FC<ContentTabProps> = ({ id, currentTab, children }) => {
    const [renderedOnce, setRenderedOnce] = useState(id === currentTab); // if this tab was loaded once, it should stay loaded, just with display:none

    useEffect(() => {
        setRenderedOnce(renderedOnce || (id === currentTab));
    }, [id, currentTab]);

    const isActive = id === currentTab;

    const renderedChildren = editProp(children, isActive);
    return (
        renderedOnce &&
        <>
            {renderedChildren}
        </>
    )
};

function editProp(children: React.ReactNode, visible: boolean): React.ReactNode {
    return React.Children.map(children, (child: React.ReactElement) => {
        if (!visible) return child;
        return React.cloneElement(child, { "tab-active": "true" });
    });
}

interface ContentTabProps {
    id: TabId,
    currentTab: TabId,
    children?: React.ReactNode
}

export default ContentTab;
