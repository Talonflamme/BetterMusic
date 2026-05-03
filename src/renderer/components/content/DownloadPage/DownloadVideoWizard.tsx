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
import Thumbnail from './Thumbnail';
import { CropHandle } from './Crop';
import { ipcRenderer } from 'electron';
import AbortIcon from '../../icons/AbortIcon';

export type Progress = "success" | "error" | "pending" | "waiting" | "abort";

const DownloadVideoWizard: React.FC<DownloadVideoWizardProps> = ({ video, setVideo, reloadFiles }) => {
    const imageCropRef = useRef<CropHandle>();

    const [imageSrc, setImageSrc] = useState<string>(null);
    const [downloading, setDownloading] = useState(false); // is downloading right now?
    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState("");
    // keep track on whether the filepath was modified, if not it dynamically changes when changing the title
    const [filepathWasModified, setFilepathWasModified] = useState(false);
    const [filepath, setFilepath] = useState("");

    // progress, null=..., true = checkmark, false = cross
    const [overallProgress, setOverallProgress] = useState<Progress>("waiting");
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
        const t = title || tryGuessTitle(video.title);
        const a = artist || tryGuessArtist(video.title);

        setDownloadProgress("waiting");
        setConvertProgress("waiting");
        setOverallProgress("pending");

        const crop = imageCropRef.current.getCropRect();

        downloadMP3(video, imageSrc, crop, filepath + ".mp3", t, a, setDownloadProgress, setConvertProgress)
            .then(() => {
                setDownloading(false);
                setOverallProgress("success");
                reloadFiles(); // reloads files in 'File' tab
            })
            .catch(err => {
                setDownloading(false);

                if (err.name === "AbortError") {
                    setOverallProgress("abort");
                } else {
                    setOverallProgress("error");
                    setErrorMessage(err?.message ?? err?.toString() ?? "[ERROR]")
                }
            });

        setDownloading(true);
    }

    const cancelDownload = () => {
        setDownloading(false);
        ipcRenderer.send("abort-download");
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
        setOverallProgress("waiting");
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
                <Thumbnail ref={imageCropRef} video={video} src={imageSrc} setSrc={setImageSrc} />

                <label id="title-input-label" htmlFor="title-input">Title</label>
                <input type="text" id="title-input" value={title} onChange={titleInputChanged} placeholder={tryGuessTitle(video?.title)} />

                <label id="artist-input-label" htmlFor="artist-input">Artist</label>
                <input type="text" id="artist-input" value={artist} onChange={e => setArtist(e.target.value)} placeholder={tryGuessArtist(video?.title)} />

                <FilepathInput value={filepath} setValue={file => {
                    setFilepathWasModified(true);
                    setFilepath(file);
                }} />

                <button className="btn flex-center download-button" onClick={onDownloadClicked}>{getDownloadButtonContent(overallProgress)}
                </button>

                <div id="progress">
                    <div className="row">
                        <label>Downloading stream:</label>
                        {getProgressDisplay(downloadProgress)}
                    </div>
                    <div className="row">
                        <label>Converting using ffmpeg:</label>
                        {getProgressDisplay(convertProgress)}
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

function getDownloadButtonContent(progress: Progress) {
    switch (progress) {
        case "waiting":
            return "Download";
        case "pending":
            return <Spinner radius={24} stroke={3} />;
        case "success":
            return <CheckmarkIcon className="download-success-icon" />;
        case "error":
            return <CancelIcon className="download-success-icon" />;
        default:
            return <AbortIcon className="download-success-icon" />
    }
}

function getProgressDisplay(progress: Progress) {
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
            return <AbortIcon className="progress-cancel" />
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
