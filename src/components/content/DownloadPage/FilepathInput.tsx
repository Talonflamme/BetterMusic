import React, { useState, useEffect } from 'react';
import path from 'path';
import fs from 'fs';
import DirectoryIcon from '../../icons/DirectoryIcon';
import { ipcRenderer } from 'electron';

const FilepathInput: React.FC<FileOutputInputProps> = ({ value, setValue }) => {
    const [validation, setValidation] = useState("");
    const [hasFocus, setHasFocus] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            validate();
        }
    }

    const onBlur = () => {
        setHasFocus(false);
        validate();
    }

    const onFocus = () => {
        setValidation("");
        setHasFocus(true);
    }

    const validate = () => {
        performValidation(value).then(setValidation);
    }

    const openDialog = () => {
        ipcRenderer.once('selected-mp3-dialog', (_event, result) => {
            if (result.canceled) return;
            const filepath: string = result.filePath.slice(0, -4); // remove .mp3
            performValidation(filepath).then(v => {
                setValidation(v);
                setValue(filepath);
            });
        });

        ipcRenderer.send('open-mp3-dialog');
    }

    useEffect(() => {
        if (hasFocus) return; // do not show error message if user is editing

        performValidation(value).then(v => {
            setValidation(v);
            setValue(value);
        });
    }, [value]);

    return (
        <>
            <label htmlFor="filepath-input">File <span className="validation">{validation}</span></label>
            <div id="filepath-input-wrapper">
                <input type="text" id="filepath-input" value={value} onChange={handleChange} onBlur={onBlur} onKeyDown={onKeyDown} onFocus={onFocus} />
                <span id="extension">.mp3</span>
                <DirectoryIcon id="select-file-icon" onClick={openDialog} />
            </div>
        </>
    )
};

async function performValidation(file: string): Promise<string> {
    const dirname = path.dirname(file);
    try {
        const stat = await fs.promises.stat(dirname);
        if (!stat.isDirectory) {
            return "Parent is no directory";
        }
    } catch (err) {
        return "Directory does not exist";
    }
    return "";
}

interface FileOutputInputProps {
    value: string,
    setValue: (file: string) => void
}

export default FilepathInput;
