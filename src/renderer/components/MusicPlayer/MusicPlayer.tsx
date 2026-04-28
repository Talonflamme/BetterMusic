import React, { useEffect, useState, useContext } from 'react';
import { Song, SongContext } from '../../Song';
import Slider from '../Slider/Slider';
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

const MusicPlayer: React.FC<MusicPlayerProps> = ({ audioRef, song }) => {
    const [progress, setProgress] = useState(0); // value between 0 and 1
    const { isPlaying, setIsPlaying } = useContext(SongContext);

    const updateTime = () => {  
        setProgress(audioRef.current.currentTime / audioRef.current.duration);
    }

    const onProgressChangedByUser = (progress: number) => {
        audioRef.current.currentTime = progress * audioRef.current.duration;
        setProgress(progress);
    }

    const setVolume = (volume: number) => {
        // raise to 2.6 because that appears to have more of an effect
        // => setting quieter seems more quiet than it really would
        audioRef.current.volume = (volume / 100) ** 2.6;
    }

    const onEnded = () => {
        setIsPlaying(false);
    }

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.addEventListener("timeupdate", updateTime);
        audioRef.current.addEventListener("loadedmetadata", () => document.getElementById("max-progress").innerText = secondsToStr(audioRef.current?.duration), { once: true });
        return () => audioRef.current.removeEventListener("timeupdate", updateTime); // cleanup
    }, [audioRef.current, song?.src]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, song?.src]);

    useEffect(() => {
        if (song.playCommand) {
            setProgress(0);
        }
        setIsPlaying(!!song.playCommand);
    }, [song?.src]);

    useEffect(() => {
        if (!audioRef.current) return;
        audioRef.current.addEventListener("ended", onEnded);
        return () => audioRef.current.removeEventListener("ended", onEnded); // cleanup
    }, [audioRef.current]);

    return (
        <footer id="player">
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
        </footer>
    )
};

interface MusicPlayerProps {
    audioRef: React.MutableRefObject<HTMLAudioElement>,
    song: Song
}

export default MusicPlayer;
