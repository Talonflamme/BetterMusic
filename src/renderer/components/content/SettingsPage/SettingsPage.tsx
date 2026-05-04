import { ipcRenderer } from 'electron';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import CheckmarkIcon from '../../icons/CheckmarkIcon';
import FilePath from './FilePath';

const SettingsPage = forwardRef<SettingsPageHandle, SettingsPageProps>(({ reloadFiles, ...props }, ref) => {
    const [filepaths, setFilepaths] = useState<string[]>([]);
    const [wasJustSaved, setWasJustSaved] = useState<boolean>(false);
    const [wasJustSavedTimeout, setWasJustSavedTimeout] = useState<NodeJS.Timeout>();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

    useEffect(() => {
        const storageString = localStorage.getItem("fileDirs");
        const unsavedString = filepaths.join(",");
        setHasUnsavedChanges(storageString !== unsavedString);
    }, [filepaths]);

    const onAdd = async () => {
        const result = await ipcRenderer.invoke('open-directory-dialog');
        if (result.canceled) return;
        setFilepaths(filepaths.concat(result.filePaths));
    }

    const save = () => {
        localStorage.setItem("fileDirs", filepaths.join(","));
        reloadFiles();
        setWasJustSaved(true);
        clearTimeout(wasJustSavedTimeout);
        setWasJustSavedTimeout(setTimeout(() => setWasJustSaved(false), 3000));
    }

    const revertChanges = () => {
        const f = localStorage.getItem("fileDirs")?.split(",") ?? [];
        setFilepaths(f.filter(x => x));
    }
    
    useEffect(() => {
        revertChanges();
    }, []);

    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => hasUnsavedChanges,
        saveChanges: save,
        discardChanges: revertChanges,
    }), [hasUnsavedChanges, filepaths]);

    return (
        <div id="settings" className="scrollable" {...props}>
            <label htmlFor="filepaths">File paths <span id="add-text" onClick={onAdd}>add</span></label>
            <div id="filepaths">
                {filepaths.map((f, i) => <FilePath key={i} pathIndex={i} filepaths={filepaths} setFilepaths={setFilepaths} />)}
            </div>
            <div id="control-buttons" className="flex-center">
                <button className="btn" onClick={save}>
                    {wasJustSaved ? <CheckmarkIcon height="100%" /> : "Save"}
                </button>
                <button className="btn" disabled={!hasUnsavedChanges} onClick={revertChanges}>Revert</button>
            </div>
        </div>
    )
});

interface SettingsPageProps {
    reloadFiles: () => void
}

export interface SettingsPageHandle {
    hasUnsavedChanges: () => boolean,
    saveChanges: () => void,
    discardChanges: () => void,
}

export default SettingsPage;
