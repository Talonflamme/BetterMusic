import { ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import FilePath from './FilePath';

const SettingsPage: React.FC<SettingsPageProps> = ({ reloadFiles, ...props }) => {
    const [filepaths, setFilepaths] = useState<string[]>([]);

    useEffect(() => {
        const f = localStorage.getItem("fileDirs")?.split(",") ?? [];
        setFilepaths(f.filter(x => x));
    }, []);

    const onAdd = async() => {
        const result = await ipcRenderer.invoke('open-directory-dialog');
        if (result.canceled) return;
        setFilepaths(filepaths.concat(result.filePaths));
    }

    const save = () => {
        localStorage.setItem("fileDirs", filepaths.join(","));
        reloadFiles();
    }

    return (
        <div id="settings" className="scrollable" {...props}>
            <label htmlFor="filepaths">File paths <span id="add-text" onClick={onAdd}>add</span></label>
            <div id="filepaths">
                {filepaths.map((f, i) => <FilePath key={i} pathIndex={i} filepaths={filepaths} setFilepaths={setFilepaths} />)}
            </div>
            <button className="btn" id="save-button" onClick={save}>
                Save
            </button>
        </div>
    )
};

interface SettingsPageProps {
    reloadFiles: () => void
}

export default SettingsPage;
