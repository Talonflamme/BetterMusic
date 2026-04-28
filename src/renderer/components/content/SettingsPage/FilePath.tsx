import React, { useState, useEffect } from 'react';
import DirectoryIcon from '../../icons/DirectoryIcon';
import { ipcRenderer } from 'electron';
import CancelIcon from '../../icons/CancelIcon';

const FilePath: React.FC<FilePathProps> = ({ pathIndex, filepaths, setFilepaths }) => {
    const setValue = (value: string) => {
        setFilepaths(filepaths.map((f, i) => { // replace this with result.filePaths[0]
            return pathIndex === i ? value : f;
        }));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const onDirIconClicked = () => {
        ipcRenderer.once('selected-directory-dialog', (_event, result) => {
            if (result.canceled) return;
            setValue(result.filePaths[0]);
        });

        ipcRenderer.send('open-directory-dialog');
    }

    const onRemove = () => {
        setFilepaths(filepaths.filter((_, i) => i !== pathIndex)); // remove this index
    }

    return (
        <div className="filepath">
            <input type="text" id="file-input" spellCheck="false" value={filepaths[pathIndex]} onChange={handleChange} />
            <DirectoryIcon id="file-icon" onClick={onDirIconClicked} />
            <CancelIcon id="remove-icon" onClick={onRemove} />
        </div>
    )
};

interface FilePathProps {
    pathIndex: number,
    filepaths: string[],
    setFilepaths: (paths: string[]) => void
}

export default FilePath;
