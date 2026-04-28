import React, { useEffect, useState } from 'react';
import Slider from '../Slider/Slider';

const VolumeControl: React.FC<VolumeControlProps> = ({ setVolume }) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        // load configuration from localStorage
        const saved = +(localStorage.getItem("volume") ?? 50);
        setValue(saved);
        setVolume(saved);
    }, []);

    const valueChanging = (volume: number) => {
        setValue(volume);
        setVolume(volume);
    }

    const onConfirm = (volume: number) => {
        valueChanging(volume);
        localStorage.setItem("volume", volume.toFixed(2));
    }

    return (
        <div id="volume-slider-container">
            <span className="icon-container flex-center volume-off">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                </svg>
            </span>
            <Slider min={0} max={100} startingValue={100} value={value} setValue={valueChanging} onlyUpdateOnConfirm={false} onConfirm={onConfirm} />
            <span className="icon-container flex-center volume-on">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
            </span>
        </div>
    )
};

interface VolumeControlProps {
    setVolume: (volume: number) => void
}

export default VolumeControl;
