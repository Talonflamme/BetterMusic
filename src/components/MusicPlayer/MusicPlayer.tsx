import React, { useEffect, useState } from 'react';
import Slider from '../Slider/Slider';
import './MusicPlayer.scss';
import PlayButton from './PlayButton';
import SongInfo from './SongInfo';
import VolumeControl from './VolumeControl';

function secondsToStr(seconds: number): string {
    if (!seconds) return "00:00";

    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = Math.floor(seconds % 60);

    return (hh > 0 ? hh.toString().padStart(2, "0") + ":" : "") + mm.toString().padStart(2, "0") + ":" + ss.toString().padStart(2, "0");
}


const MusicPlayer: React.FC<MusicPlayerProps> = ({ audioRef }) => {
    const [progress, setProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const updateTime = () => {
        setProgress(audioRef.current.currentTime / audioRef.current.duration);
    }

    const onProgressChangedByUser = (progress: number) => {
        audioRef.current.currentTime = progress * audioRef.current.duration;
        setProgress(progress);
    }

    useEffect(() => {
        audioRef.current.addEventListener("timeupdate", updateTime);
        return () => audioRef.current.removeEventListener("timeupdate", updateTime);
    }, [audioRef.current]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying]);

    const setVolume = (volume: number) => {
        // raise to 2.6 because that appears to have more of an effect
        // => setting quieter seems more quiet than it really would
        audioRef.current.volume = (volume / 100) ** 2.6;
    }

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.addEventListener("loadedmetadata", () => document.getElementById("max-progress").innerText = secondsToStr(audioRef.current?.duration), { once: true });
    }, [audioRef.current]);

    return (
        <div id="player">
            <SongInfo />
            <div id="middle-section" className="flex-center">
                <PlayButton isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

                <div id="music-progress-slider">
                    <span className="label flex-center" id="current-progress">{secondsToStr(progress * audioRef.current?.duration)}</span>
                    <span className="slider-wrapper">
                        <Slider min={0} max={1} value={progress} setValue={onProgressChangedByUser} />
                    </span>
                    <span className="label flex-center" id="max-progress">{secondsToStr(audioRef.current?.duration)}</span>
                </div>
            </div>
            <VolumeControl setVolume={setVolume} />
        </div>
    )
};

interface MusicPlayerProps {
    audioRef: React.MutableRefObject<HTMLAudioElement>
}

export default MusicPlayer;
