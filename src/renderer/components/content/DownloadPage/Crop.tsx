import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

/**
 * The crop settings of a thumbnail. Relative to the image size. If an image has a width of 500px,
 * and right is equal to 50, then the edge will always be at 90% of the image. If said image
 * is rendered with 480px, then the edge must appear at 432 (= 480*90%), even though the value
 * of right must still be 50.
 */
export interface CropRectangle {
    left: number,
    top: number,
    right: number,
    bottom: number
}

const CROP_ZERO: CropRectangle = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
}

/**
 * Update the visuals of each corner. If axis=vertical, then the top and bottom corners are swapped (the classnames), if axis=horizontal, then the left and right corners are swapped (classnames)
 * @param cropWrapper the parent of each corner. Used with querySelectorAll('.crop-corner') to select each corner 
 */
function swapCornerAxis(axis: 'vertical' | 'horizontal', cropWrapper: HTMLElement) {
    cropWrapper.querySelectorAll(".crop-corner").forEach(corner => {
        corner.classList.toggle(axis === 'vertical' ? 'top' : 'left');
        corner.classList.toggle(axis === 'vertical' ? 'bottom' : 'right');
    });
}

const Crop = forwardRef<CropHandle, CropProps>(({ imgSrc, videoId }, ref) => {
    const [crop, setCrop] = useState<CropRectangle>(CROP_ZERO);
    const [draggingCorner, setDraggingCorner] = useState<HTMLDivElement>();

    // pixels relative to the corner clicked, where exactly the user clicked on it
    const [[mouseRelativeToCornerX, mouseRelativeToCornerY], setMouseRelativeToCornerXY] = useState<[number, number]>([NaN, NaN]);

    const cropStyle = {
        "--crop-left": `${crop.left * 100}%`,
        "--crop-right": `${crop.right * 100}%`,
        "--crop-top": `${crop.top * 100}%`,
        "--crop-bottom": `${crop.bottom * 100}%`
    } as React.CSSProperties;

    const onCornerPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
        if (e.button !== 0) return; // only left click

        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId); // capture all future pointer events
        setDraggingCorner(target);

        const targetRect = target.getBoundingClientRect();
        setMouseRelativeToCornerXY([e.clientX - targetRect.x, e.clientY - targetRect.y]);
    };

    const onCornerPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
        const target = e.currentTarget;
        if (target !== draggingCorner) return;

        const wrapperRect = target.parentElement.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        let x = e.clientX - wrapperRect.left;
        let y = e.clientY - wrapperRect.top;

        // keep values to valid range
        x = Math.max(Math.min(x, wrapperRect.width), 0);
        y = Math.max(Math.min(y, wrapperRect.height), 0);

        const crop2: CropRectangle = { ...crop };

        if (target.classList.contains("top")) {
            const top = (y - mouseRelativeToCornerY) / wrapperRect.height;
            crop2.top = Math.max(Math.min(top, 1), 0);

        } else if (target.classList.contains("bottom")) {
            const bottom = 1 - (y + targetRect.height - mouseRelativeToCornerY) / wrapperRect.height;
            crop2.bottom = Math.max(Math.min(bottom, 1), 0);
        }

        if (target.classList.contains("left")) {
            const left = (x - mouseRelativeToCornerX) / wrapperRect.width;
            crop2.left = Math.max(Math.min(left, 1), 0);

        } else if (target.classList.contains("right")) {
            const right = 1 - (x + targetRect.width - mouseRelativeToCornerX) / wrapperRect.width;
            crop2.right = Math.max(Math.min(right, 1), 0);
        }

        // check if top-bottom or left-right need to be swapped (if e.g. the user drags the top left corner below the bottom left one)
        if (crop2.top > 1 - crop2.bottom) {
            [crop2.top, crop2.bottom] = [1 - crop2.bottom, 1 - crop2.top];
            swapCornerAxis('vertical', target.parentElement);
        }

        if (crop2.left > 1 - crop2.right) {
            [crop2.left, crop2.right] = [1 - crop2.right, 1 - crop2.left];
            swapCornerAxis('horizontal', target.parentElement);
        }

        setCrop(crop2);
    };

    const onCornerPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
        const target = e.currentTarget;
        if (target !== draggingCorner) return;

        target.releasePointerCapture(e.pointerId);
        setDraggingCorner(null);
    };

    useEffect(() => {
        // whenever video changes/wizard is opened, reset
        setCrop({ left: 0, right: 0, top: 0, bottom: 0 });
        setDraggingCorner(null);
    }, [videoId, imgSrc]);

    useImperativeHandle(ref, () => ({
        getCropRect: () => crop
    }));

    return (
        <div className="crop-wrapper" style={cropStyle}>
            <div className="crop-cover"></div>
            <div className="crop-corner top left" onPointerDown={onCornerPointerDown} onPointerUp={onCornerPointerUp} onPointerCancel={onCornerPointerUp} onPointerMove={onCornerPointerMove}></div>
            <div className="crop-corner bottom left" onPointerDown={onCornerPointerDown} onPointerUp={onCornerPointerUp} onPointerCancel={onCornerPointerUp} onPointerMove={onCornerPointerMove}></div>
            <div className="crop-corner bottom right" onPointerDown={onCornerPointerDown} onPointerUp={onCornerPointerUp} onPointerCancel={onCornerPointerUp} onPointerMove={onCornerPointerMove}></div>
            <div className="crop-corner top right" onPointerDown={onCornerPointerDown} onPointerUp={onCornerPointerUp} onPointerCancel={onCornerPointerUp} onPointerMove={onCornerPointerMove}></div>
        </div>
    )
});

interface CropProps {
    imgSrc: string,
    videoId: string,
}

export interface CropHandle {
    getCropRect: () => CropRectangle
}

export default Crop;
