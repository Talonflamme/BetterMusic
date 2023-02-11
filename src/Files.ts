import React, { useMemo } from 'react';


const fileDirs = localStorage.getItem("fileDirs")?.split(",") ?? [];

export function useFiles() {
    const files = useMemo(() => {
        try {
            const lst: string[] = [];
            fileDirs.forEach(dir => {
                const fs = window.require('fs'); // todo
                const read = fs.readdirSync(dir);
                lst.push(...read);
            })
        } catch (err) {
            console.error(err);
        }
    }, [fileDirs]);

    return files;
}
