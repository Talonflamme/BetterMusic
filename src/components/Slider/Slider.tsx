import React, { useState, useRef, useEffect } from 'react';
import './Slider.scss';

const Slider: React.FC<SliderProps> = ({ min, max, startingValue, className, value, setValue, onlyUpdateOnConfirm, onConfirm, ...props }) => {
    // internal value is used when either no value is provided in props or when currently dragging
    const [internalValue, setInternalValue] = useState(startingValue);
    const [dragging, setDragging] = useState(false); // if the thumb is currently dragged
    const sliderRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (value !== null && value !== undefined && !dragging) {
            setInternalValue(value);
        }
    }, [value]);

    const adjustValue = (e: MouseEvent | React.MouseEvent, isDragging: boolean) => {
        if (!sliderRef.current) return;

        const elementPos = sliderRef.current.getBoundingClientRect();
        const clickPos = e.clientX - elementPos.left;
        const containerWidth = elementPos.width;
        let ratio = clickPos / containerWidth;
        ratio = Math.min(Math.max(ratio, 0), 1); // keep ratio between 0-1
        const v = (max - min) * ratio + min;
        if (!isDragging) {
            setInternalValue(v);
            if (onConfirm) {
                onConfirm(v);
            } else {
                setValue?.(v);
            }
        } else {
            if (!onlyUpdateOnConfirm) {
                setValue?.(v); 
            }
            setInternalValue(v); // only set internal value (called when currently dragging)
        }
    }

    const adjustValueInternal = (e: MouseEvent | React.MouseEvent) => { // function to adjust internal but not external
        adjustValue(e, true);
    }

    const onTrackClicked = (e: React.MouseEvent<HTMLSpanElement>) => {
        if (!sliderRef.current) return;
        if ((e.target as Element).matches(".slider-thumb")) return; // do not adjust if target is the thumb
        adjustValue(e, false);
    }

    const onThumbMouseUp = (e: MouseEvent) => {
        window.removeEventListener("mousemove", adjustValueInternal);
        window.removeEventListener("mouseup", onThumbMouseUp);
        setDragging(false);
        adjustValue(e, false);
    }

    const onThumbMouseDown = (e: MouseEvent | React.MouseEvent) => {
        e.preventDefault();
        window.addEventListener("mousemove", adjustValueInternal);
        window.addEventListener("mouseup", onThumbMouseUp);
        setDragging(true);
    }

    const percentage = `${(((dragging ? internalValue : (value ?? internalValue)) + min) / max * 100).toFixed(2)}%`;
    return (
        <span className={`slider-root ${className}`} ref={sliderRef} onClick={onTrackClicked} data-dragging={dragging} {...props}>
            <span className="slider-track slider-rail"></span>
            <span className="slider-track slider-taken" style={{ width: percentage }}></span>
            <span className="slider-thumb" draggable="false" style={{ left: percentage }} onMouseDown={onThumbMouseDown}></span>
        </span>
    )
};

type SliderProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> & {
    min: number,
    max: number,
    startingValue?: number,
    /**
     * Optional value control. If it is provided, {@link setValue} should be provided as well.
     */
    value?: number,
    /**
     * Called when value (or internalValue if value is missing) is changed.
     */
    setValue?: (value: number) => void,
    /**
     * Whether to only call {@link setValue} if the value is confirmed (user releases thumb) and not when dragging.
     */
    onlyUpdateOnConfirm?: boolean,
    /**
     * Called when change is confirmed (User clicks on track or releases thumb).
     */
    onConfirm?: (value: number) => void
}

Slider.defaultProps = {
    startingValue: 0,
    className: "",
    onlyUpdateOnConfirm: true
}

export default Slider;
