import React from 'react';
import DownloadIcon from '../../icons/DownloadIcon';
import PlayIcon from '../../icons/PlayIcon';
import { YtVideo } from './YouTubeSearch';

const SearchResult: React.FC<SearchResultProps> = ({ video, setDownload, setPreview }) => {
    const onDownloadClicked = () => {
        setDownload(video);
    }

    const onPlayClicked = () => {
        if (!video?.vidId) return;
        setPreview(video);
    };

    return (
        <div className="search-result">
            <img className="thumbnail" src={video.thumbnail} alt={`Thumbnail: ${video.title}`} />
            <div className="details">
                <div className="channel-info flex-center">
                    <img className="channel-thumbnail" src={video.channelThumbnail} alt={`Thumbnail: ${video.channel}`} />
                    <span className="label">{video.channel}</span>
                </div>
                <div className="video-info">
                    <div className="title label">{video.title}</div>
                    <div className="views label">{video.views}</div>
                    <div className="release-date label">{video.releaseDate}</div>
                    <div className="length label">{video.length}</div>
                </div>
            </div>
            <div className="download-button overlay-button" onClick={onDownloadClicked}>
                <DownloadIcon className="icon" />
            </div>
            <div className="play-button overlay-button" onClick={onPlayClicked}>
                <PlayIcon className="icon" />
            </div>
        </div>
    )
};

interface SearchResultProps {
    video: YtVideo,
    setDownload: (url: YtVideo) => void,
    setPreview: (vid: YtVideo) => void,
}

export default SearchResult;
