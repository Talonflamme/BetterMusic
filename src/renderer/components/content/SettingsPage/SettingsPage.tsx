import { ipcRenderer } from 'electron';
import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import CheckmarkIcon from '../../icons/CheckmarkIcon';
import Tooltip from '../../Tooltip';
import FilePath from './FilePath';

export type ErrorLevel = "warn" | "critical" | "none";

const SettingsPage = forwardRef<SettingsPageHandle, SettingsPageProps>(({ reloadFiles, ...props }, ref) => {
    const saveButtonRef = useRef<HTMLElement>();

    const [filepaths, setFilepaths] = useState<string[]>([]);
    // any errors of filepaths and their level. keys are indices. When an index is not used anymore, the value of that key must be "none" or the key removed
    // all indices used must exist as a key
    const [fileErrors, setFileErrors] = useState<Record<number, ErrorLevel>>({});
    const [wasJustSaved, setWasJustSaved] = useState<boolean>(false);
    const [wasJustSavedTimeout, setWasJustSavedTimeout] = useState<NodeJS.Timeout>();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
    
    const hasCriticalErrors = Object.values(fileErrors).some(v => v === "critical");

    useEffect(() => {
        const storageString = localStorage.getItem("fileDirs") ?? "";
        const unsavedString = filepaths.join(",");
        setHasUnsavedChanges(storageString !== unsavedString);
    }, [filepaths]);

    const onAdd = async () => {
        const result = await ipcRenderer.invoke('open-directory-dialog');
        if (result.canceled) return;
        setFilepaths(filepaths.concat(result.filePaths));
    }

    const save = () => {
        if (hasCriticalErrors) {
            console.error("Save was called when having critical errors. Not saved.");
            return;
        }

        localStorage.setItem("fileDirs", filepaths.join(","));
        reloadFiles();
        setWasJustSaved(true);
        clearTimeout(wasJustSavedTimeout);
        setWasJustSavedTimeout(setTimeout(() => setWasJustSaved(false), 3000));
        setHasUnsavedChanges(false);
    }

    const revertChanges = () => {
        const f = localStorage.getItem("fileDirs")?.split(",") ?? [];
        setFilepaths(f.filter(x => x));
        setFileErrors(Object.keys(f).reduce((acc, _, i) => {
            acc[i] = "none";
            return acc;
        }, {} as typeof fileErrors));
    }

    useEffect(() => {
        revertChanges();
    }, []);

    useImperativeHandle(ref, () => ({
        hasUnsavedChanges: () => hasUnsavedChanges,
        saveChanges: save,
        discardChanges: revertChanges,
        hasCriticalErrors: () => hasCriticalErrors,
    }), [hasUnsavedChanges, filepaths, hasCriticalErrors]);

    return (
        <div id="settings" className="scrollable" {...props}>
            <label htmlFor="filepaths">File paths <span id="add-text" onClick={onAdd}>add</span></label>
            <div id="filepaths">
                {filepaths.map((f, i) => <FilePath key={i} pathIndex={i} filepaths={filepaths} setFilepaths={setFilepaths} fileErrors={fileErrors} setFileErrors={setFileErrors} />)}
            </div>
            <div id="control-buttons" className="flex-center">
                <span className="save-btn-wrapper" ref={saveButtonRef}>
                    <button className="btn" disabled={hasCriticalErrors} onClick={save}>
                        {wasJustSaved ? <CheckmarkIcon height="100%" /> : "Save"}
                    </button>
                </span>

                <button className="btn" disabled={!hasUnsavedChanges} onClick={revertChanges}>Revert</button>

                <Tooltip parent={saveButtonRef} enabled={hasCriticalErrors}>Please fix any errors</Tooltip>
            </div>
        </div>
    )
});

interface SettingsPageProps {
    reloadFiles: () => void
}

export interface SettingsPageHandle {
    hasUnsavedChanges: () => boolean,
    hasCriticalErrors: () => boolean,
    saveChanges: () => void,
    discardChanges: () => void,
}

export default SettingsPage;
