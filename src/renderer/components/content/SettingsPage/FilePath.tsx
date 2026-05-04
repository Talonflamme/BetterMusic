import { ipcRenderer } from 'electron';
import React, { useState, useEffect } from 'react';
import CancelIcon from '../../icons/CancelIcon';
import DirectoryIcon from '../../icons/DirectoryIcon';
import FileErrorDisplay from './FileErrorDisplay';
import fs from 'fs';
import path from 'path';

export type ErrorLevel = "warn" | "critical" | "none";

function isPathEqual(a: string, b: string): boolean {
    let resolved1 = path.resolve(a);
    let resolved2 = path.resolve(b);

    resolved1 = resolved1.replace(/\\/g, '/');
    resolved2 = resolved2.replace(/\\/g, '/');

    const isCaseSensitive = process.platform === "linux";

    if (!isCaseSensitive) {
        resolved1 = resolved1.toLowerCase();
        resolved2 = resolved2.toLowerCase();
    }

    return resolved1 === resolved2;
}

const FilePath: React.FC<FilePathProps> = ({ pathIndex, filepaths, setFilepaths }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errorLevel, setErrorLevel] = useState<ErrorLevel>("none");

    useEffect(() => {
        const dir = filepaths[pathIndex];

        // check if path is duplicate
        for (let i = 0; i < pathIndex; i++) {
            if (isPathEqual(dir, filepaths[i])) {
                setErrorLevel("critical");
                setErrorMessage("Duplicate directory, must be removed");
                return;
            }
        }

        if (!fs.existsSync(dir)) {
            setErrorLevel("warn");
            setErrorMessage("Path does not exist");
            return;
        }

        setErrorLevel("none");
        setErrorMessage(null);
    }, [filepaths, pathIndex]);

    const setValue = (value: string) => {
        setFilepaths(filepaths.map((f, i) => { // replace this with result.filePaths[0]
            return pathIndex === i ? value : f;
        }));
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const onDirIconClicked = async () => {
        const result = await ipcRenderer.invoke('open-directory-dialog');
        if (result.canceled) return;
        setValue(result.filePaths[0]);
    }

    const onRemove = () => {
        setFilepaths(filepaths.filter((_, i) => i !== pathIndex)); // remove this index
    }

    return (
        <div className="filepath">
            <input type="text" id="file-input" spellCheck="false" value={filepaths[pathIndex]} onChange={handleChange} />
            <FileErrorDisplay errorLevel={errorLevel} errorMessage={errorMessage} />
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
