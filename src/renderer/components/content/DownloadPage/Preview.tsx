import React, { useEffect, useState, useRef, useContext } from 'react';
import { ipcRenderer } from 'electron';
import { YtVideo } from './YouTubeSearch';
import IconButton from '../../icons/IconButton';
import CancelIcon from '../../icons/CancelIcon';
import { SongContext } from '../../../Song';

const Preview: React.FC<PreviewProps> = ({ video, setVideo, setDownload }) => {
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const { setIsPlaying } = useContext(SongContext);

    const audioRef = useRef<HTMLAudioElement>(null);

    const onCloseButton = () => {
        setVideo(null);
        setAudioUrl(null);
    };

    const onDownloadButton = () => {
        // close this overlay
        setVideo(null);
        setAudioUrl(null);

        // open download wizard
        setDownload(video);
    };

    useEffect(() => {
        if (!video?.vidId) {
            setAudioUrl(null);
            return;
        }

        ipcRenderer.invoke("get-audio-url", video.vidId)
            .then(url => {
                setAudioUrl(url);
                setIsPlaying(false); // pause main audio player
            })
            .catch(err => {
                console.error(`Failed to get url for '${video.vidId}': `, err);
                setAudioUrl(null);
            });
    }, [video?.vidId]);

    return (
        <div id="preview-overlay" className="background-overlay" style={video !== null ? { display: "block" } : {}}>
            <div id="preview" className="overlay-modal">
                <IconButton className="cancel-button" onClick={onCloseButton}>
                    <CancelIcon />
                </IconButton>

                <h3>{video?.title}</h3>
                <img className="thumbnail" src={video?.thumbnail} alt={`Thumbnail: ${video?.title}`} />
                <audio id="preview-audio" src={audioUrl ?? ""} ref={audioRef} autoPlay={true} controls></audio>
                <button className="btn" id="download-button" onClick={onDownloadButton}>Download</button>
            </div>
        </div>
    )
};

interface PreviewProps {
    video: YtVideo,
    setDownload: (vid: YtVideo) => void,
    setVideo: (vid: YtVideo) => void,
}

export default Preview;
