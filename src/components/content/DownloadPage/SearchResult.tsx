import React from 'react';
import DownloadIcon from '../../icons/DownloadIcon';
import { YtVideo } from './YouTubeSearch';

const SearchResult: React.FC<SearchResultProps> = ({ video, setDownload }) => {
    const onDownloadClicked = () => {
        setDownload(video);
    }

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
                </div>
            </div>
            <div className="download-button" onClick={onDownloadClicked}>
                <DownloadIcon id="download-icon" />
            </div>
        </div>
    )
};

interface SearchResultProps {
    video: YtVideo,
    setDownload: (url: YtVideo) => void
}

export default SearchResult;
