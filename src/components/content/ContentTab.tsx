import React, { useEffect, useState } from 'react';

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
        if (visible) return child;
        const style = child.props.style ?? {};
        return React.cloneElement(child, { style: { ...style, display: "none" } });
    });
}

interface ContentTabProps {
    id: number,
    currentTab: number,
    children?: React.ReactNode
}

export default ContentTab;
