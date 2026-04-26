import React, { useEffect, useState } from 'react';
import { installFirstYtDlp, isYtDlpInstalled, updateYtDlp } from './YtDlp';
import CancelIcon from '../../icons/CancelIcon';
import Spinner from 'react-spinner-material';

type SetProgressFunction = (progress: Progress) => void;
type Progress = 'error' | 'success' | 'pending';

async function checkYtDlpInstallation(setUpdateProgress: SetProgressFunction, setTooltip: (t: string) => void) {
    try {
        if (!await isYtDlpInstalled()) {
            setTooltip("Installing yt-dlp...");
            await installFirstYtDlp();
        } else {
            setTooltip("Updating yt-dlp...");
            await updateYtDlp();
        }

        setTooltip("");
        setUpdateProgress("success");
    }
    catch (e) {
        console.error(e);
        setUpdateProgress("error");
        setTooltip("Installation failed, click to install fresh");
    }
}

/// Responsible for downloading the yt-dlp.exe and keeping it up-to-date
const UpdaterComponent: React.FC = () => {
    const [updateProgress, setUpdateProgress] = useState<Progress>('pending');
    const [tooltip, setTooltip] = useState<string>("");

    useEffect(() => {
        checkYtDlpInstallation(setUpdateProgress, setTooltip);
    }, []);

    return (
        <span className='flex-center' style={{ padding: 8 }}>
            {get_progress_display(updateProgress, tooltip)}
        </span>
    )
};

function get_progress_display(progress: Progress, title?: string) {
    switch (progress) {
        case 'error':
            return <span title={title}><CancelIcon className="progress-cancel" /></span>;
        case 'success':
            return <></>; // show nothing
        case "pending":
            return <span title={title}><Spinner radius={24} color="currentColor" /></span>;
    }
}

export default UpdaterComponent;
