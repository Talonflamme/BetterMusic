import { ipcRenderer } from 'electron';
import React, { forwardRef, useImperativeHandle } from 'react';
import CancelIcon from '../../icons/CancelIcon';
import IconButton from '../../icons/IconButton';
import { YtVideo } from './YouTubeSearch';


const Thumbnail = forwardRef<ThumbnailHandle, ThumbnailProps>(({ video, src, setSrc }, ref) => {
    const removeCustomThumbnail = () => {
        setSrc(video.thumbnail);
    };

    const openImageDialog = async() => {
        const result = await ipcRenderer.invoke('open-image-dialog');
        if (result.canceled) return;
        setSrc(result.filePaths[0]);
    };

    useImperativeHandle(ref, () => ({
        imageSrc: src
    }));

    return (
        <div className="thumbnail-wrapper flex-center">
            <img src={src} alt={`Thumbnail: ${video?.title}`} className="thumbnail" onClick={openImageDialog} />
            {
                video?.thumbnail !== src &&
                <IconButton className="remove-thumbnail-button" onClick={removeCustomThumbnail} >
                    <CancelIcon />
                </IconButton>
            }
        </div>
    )
});

export interface ThumbnailHandle {
    imageSrc: string
}

interface ThumbnailProps {
    video: YtVideo,
    src: string,
    setSrc: (src: string) => void,
}

export default Thumbnail;
