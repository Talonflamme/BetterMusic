import React, { useEffect, useRef, useState } from 'react';
import CancelIcon from '../../icons/CancelIcon';
import { YtVideo } from './YouTubeSearch';
import IconButton from '../../icons/IconButton';
import Spinner from 'react-spinner-material';
import { downloadMP3 } from './Download';
import FilepathInput from './FilepathInput';
import path from 'path';
import os from 'os';
import CheckmarkIcon from '../../icons/CheckmarkIcon';
import Thumbnail, { ThumbnailHandle } from './Thumbnail';

export type Progress = "success" | "error" | "pending" | "waiting";

const DownloadVideoWizard: React.FC<DownloadVideoWizardProps> = ({ video, setVideo, reloadFiles }) => {
    const thumbnailRef = useRef<ThumbnailHandle>();
    const [imageSrc, setImageSrc] = useState<string>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null);
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    // keep track on whether the filepath was modified, if not it dynamically changes when changing the title
    const [filepathWasModified, setFilepathWasModified] = useState(false);
    const [filepath, setFilepath] = useState("");

    // progress, null=..., true = checkmark, false = cross
    const [downloadProgress, setDownloadProgress] = useState<Progress>("waiting");
    const [convertProgress, setConvertProgress] = useState<Progress>("waiting");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


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
        const a = artist || tryGuessArtist(video.title);

        setDownloadProgress("waiting");
        setConvertProgress("waiting");

        downloadMP3(video, imageSrc, filepath + ".mp3", t, a, setDownloadProgress, setConvertProgress, setErrorMessage)
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

    const onCloseButton = () => {
        setDownloadProgress("waiting");
        setConvertProgress("waiting");
        setVideo(null);
    }

    const titleInputChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);

        if (!filepathWasModified) {
            setFilepath(getDefaultFilepath(event.target.value || tryGuessTitle(video?.title)));
        }
    }

    // when the wizard is opened
    useEffect(() => {
        if (!video) return;

        setImageSrc(video.thumbnail);
        const t = tryGuessTitle(video?.title);
        setFilepathWasModified(false);
        setTitle("");
        setArtist("");
        setFilepath(getDefaultFilepath(t));
        setErrorMessage(null);
    }, [video?.vidId]);

    useEffect(() => {
        setDownloadSuccess(null);
        setDownloadProgress("waiting");
        setConvertProgress("waiting");
    }, [video?.vidId, title, artist, filepath, imageSrc]);

    return (
        <div id="download-wizard-overlay" style={video ? { display: 'block' } : {}}>
            <div id="download-wizard" className="scrollable">
                <IconButton className="cancel-button" onClick={onCloseButton}>
                    <CancelIcon />
                </IconButton>

                <h3>Download Wizard</h3>
                <Thumbnail ref={thumbnailRef} video={video} src={imageSrc} setSrc={setImageSrc} />

                <label id="title-input-label" htmlFor="title-input">Title</label>
                <input type="text" id="title-input" value={title} onChange={titleInputChanged} placeholder={tryGuessTitle(video?.title)} />

                <label id="artist-input-label" htmlFor="artist-input">Artist</label>
                <input type="text" id="artist-input" value={artist} onChange={e => setArtist(e.target.value)} placeholder={tryGuessArtist(video?.title)} />

                <FilepathInput value={filepath} setValue={file => {
                    setFilepathWasModified(true);
                    setFilepath(file);
                }} />

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

                <div id="progress">
                    <div className="row">
                        <label>Downloading stream:</label>
                        {get_progress_display(downloadProgress)}
                    </div>
                    <div className="row">
                        <label>Converting using ffmpeg:</label>
                        {get_progress_display(convertProgress)}
                    </div>
                    <div className="row">
                        <span>{errorMessage === null ? "" : "Error: "}</span>
                        <span className="error scrollable">{errorMessage}</span>
                    </div>
                </div>
            </div>
        </div>
    )
};

function get_progress_display(progress: Progress) {
    switch (progress) {
        case "success":
            return <CheckmarkIcon className="progress-checkmark" />;
        case "error":
            return <CancelIcon className="progress-cancel" />;
        case "pending":
            return <Spinner radius={24} color="currentColor" />;
        case "waiting":
            return <span className="ellipsis">&#8943;</span>;
        default:
            return <span>/UNEXPECTED PROGRESS\</span>
    }
}

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
