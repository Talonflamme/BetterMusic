import React, { useEffect, useRef, useState } from 'react';
import CancelIcon from '../../icons/CancelIcon';
import { YtVideo } from './YouTubeSearch';
import { ipcRenderer } from 'electron';
import IconButton from '../../icons/IconButton';
import Spinner from 'react-spinner-material';
import { downloadMP3 } from './Download';
import FilepathInput from './FilepathInput';
import path from 'path';
import os from 'os';
import CheckmarkIcon from '../../icons/CheckmarkIcon';

const DownloadVideoWizard: React.FC<DownloadVideoWizardProps> = ({ video, setVideo, reloadFiles }) => {
    const [imageSrc, setImageSrc] = useState<string>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null);
    const [title, setTitle] = useState("");
    const [filepath, setFilepath] = useState("");
    const artistRef = useRef<HTMLInputElement>(null);

    const openImageDialog = () => {
        ipcRenderer.once('selected-image-dialog', (_event, result) => {
            if (result.canceled) return;
            setImageSrc(result.filePaths[0]);
        })

        ipcRenderer.send('open-image-dialog');
    };

    const removeCustomThumbnail = () => {
        setImageSrc(video.thumbnail);
    }

    const onDownloadClicked = () => {
        if (downloading) {
            cancelDownload();
        } else {
            download();
        }
    }

    const download = () => {
        if (downloadSuccess === true) return;

        const t = title || tryGuessTitle(video.title);
        const a = artistRef.current.value || tryGuessArtist(video.title);
        downloadMP3(video, imageSrc, filepath + ".mp3", t, a)
            .then(() => {
                setDownloading(false);
                setDownloadSuccess(true);
                reloadFiles(); // reloads files in 'File' tab
            })
            .catch(err => {
                setDownloading(false);
                setDownloadSuccess(false);
            });
        setDownloading(true);
    }

    const cancelDownload = () => {
        setDownloading(false);
    }

    useEffect(() => {
        if (!video) return;
        setImageSrc(video.thumbnail);
        const t = title || tryGuessTitle(video?.title);
        setFilepath(getDefaultFilepath(t));
    }, [video?.vidId]);

    useEffect(() => {
        setDownloadSuccess(null);
    }, [video?.vidId, title, artistRef.current?.value, filepath, imageSrc]);

    return (
        <div id="download-wizard-overlay" style={video ? { display: 'block' } : {}}>
            <div id="download-wizard" className="scrollable">
                <IconButton className="cancel-button" onClick={() => setVideo(null)}>
                    <CancelIcon />
                </IconButton>

                <h3>Download Wizard</h3>
                <div className="thumbnail-wrapper flex-center">
                    <img src={imageSrc} alt={`Thumbnail: ${video?.title}`} className="thumbnail" onClick={openImageDialog} />
                    {
                        video?.thumbnail !== imageSrc &&
                        <IconButton className="remove-thumbnail-button" onClick={removeCustomThumbnail} >
                            <CancelIcon />
                        </IconButton>
                    }
                </div>

                <label id="title-input-label" htmlFor="title-input">Title</label>
                <input type="text" id="title-input" value={title} onChange={e => setTitle(e.target.value)} placeholder={tryGuessTitle(video?.title)} />

                <label id="artist-input-label" htmlFor="artist-input">Artist</label>
                <input type="text" id="artist-input" placeholder={tryGuessArtist(video?.title)} ref={artistRef} />

                <FilepathInput value={filepath} setValue={setFilepath} />

                <button className="btn flex-center download-button" onClick={onDownloadClicked}>{
                    downloadSuccess === null ?
                        (downloading ?
                            <Spinner radius={24} stroke={3} />
                            : "Download") :
                        (downloadSuccess ?
                            <CheckmarkIcon className="download-success-icon" /> :
                            <CancelIcon className="download-success-icon" />)
                }
                </button>

            </div>
        </div>
    )
};

function getDefaultFilepath(title: string): string {
    const musicPath = process.env.MUSIC_PATH;
    if (musicPath) return path.join(musicPath, title);
    const fileDirs = localStorage.getItem("fileDirs")?.split(",")?.filter(x => x) ?? [];
    if (fileDirs.length) return path.join(fileDirs[0], title);
    return path.join(os.homedir(), title);
}

/**
 * Tries to predict the title of a song based on its YouTube music video title
 */
function tryGuessTitle(title: string): string {
    if (!title) return null;
    let split = title.split("-", 2); // first assume title is in pattern: 'Artist - Title (...)'

    if (split.length === 2) {
        return removeBrackets(split[1]);
    }

    split = title.split("by"); // assume pattern: 'Title by Artist (...)'

    if (split.length === 2) {
        return removeBrackets(split[0]);
    }

    return "Title"; // give up, unknown title
}

/**
 * Tries to predict the artist of a song based on its YouTube music video title.
 */
function tryGuessArtist(title: string): string {
    if (!title) return null;
    let split = title.split("-", 2); // first assume title is in pattern: 'Artist - Title (...)'

    if (split.length === 2) {
        return removeBrackets(split[0]);
    }

    split = title.split("by"); // assume pattern: 'Title by Artist (...)'

    if (split.length === 2) {
        return removeBrackets(split[1]);
    }

    return "Artist"; // give up, unknown artist
}

function removeBrackets(str: string) {
    // replace content inside brackets
    return str.replace(/[([].*?[)\]]/g, "").trim();
}

interface DownloadVideoWizardProps {
    video?: YtVideo,
    setVideo: (url: YtVideo) => void,
    reloadFiles: () => void
}

export default DownloadVideoWizard;
