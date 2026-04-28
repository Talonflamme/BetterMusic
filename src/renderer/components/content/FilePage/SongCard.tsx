import React, { useContext } from 'react';
import { Song, SongContext } from '../../../Song';
import PauseIcon from '../../icons/PauseIcon';
import PlayIcon from '../../icons/PlayIcon';

const SongCard: React.FC<SongCardProps> = ({ song }) => {
    const { song: currentSong, setSong: setCurrentSong, isPlaying: isCurrentSongPlaying, setIsPlaying: setIsCurrentSongPlaying } = useContext(SongContext);

    const isCurrentSong = song.src === currentSong.src;

    const onPlayButtonClicked = () => {
        if (song.src === currentSong.src) { // song is playing already
            setIsCurrentSongPlaying(!isCurrentSongPlaying);
        } else {
            setCurrentSong({ ...song, playCommand: true });
        }
    }

    return (
        <div className={`${isCurrentSong ? "current-song " : ""}song-card flex-center`}>
            <img className="song-cover" src={song.imagePath} alt={`Album Cover of ${song.title}`} />
            <div className="song-info">
                <button className="btn play-button" onClick={onPlayButtonClicked} title="Play song">
                    {
                        !isCurrentSong || !isCurrentSongPlaying ? <PlayIcon /> : <PauseIcon />
                    }
                </button>
                <div className="song-details">
                    <div className="label title" title={song.title}>{song.title}</div>
                    <div className="label artist" title={song.artist}>{song.artist}</div>
                </div>
            </div>
        </div>
    );
};

interface SongCardProps {
    song: Song
}

export default SongCard;
