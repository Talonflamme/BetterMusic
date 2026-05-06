import React, { RefObject, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './tooltip.scss';

const Tooltip: React.FC<indexProps> = ({ children, parent, gap = 8, enabled }) => {
    const [pos, setPos] = useState<{ top: number, left: number } | null>(null);

    useEffect(() => {
        const el = parent.current;
        if (!el) return;

        const handleMouseEnter = () => {
            const rect = el.getBoundingClientRect();
            setPos({
                top: rect.top + window.scrollY - gap, // 8px gap above icon
                left: rect.left + window.scrollX + rect.width / 2,
            });
        };

        const handleMouseLeave = () => setPos(null);

        el.addEventListener("mouseenter", handleMouseEnter);
        el.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            el.removeEventListener("mouseenter", handleMouseEnter);
            el.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [parent.current, gap]);

    if (!pos || !children || (enabled !== undefined && !enabled)) return;

    // Create portal, otherwise there are issues with overflowing
    return createPortal(
        <div className="tooltip-bubble" style={{ top: pos.top, left: pos.left }}>
            {children}
        </div>,
        document.body
    );
};

interface indexProps extends React.PropsWithChildren {
    parent: RefObject<HTMLElement>,
    gap?: number,
    enabled?: boolean
}

export default Tooltip;
