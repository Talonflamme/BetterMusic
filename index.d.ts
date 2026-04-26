declare module '*.png' {
    const value: any;
    export default value;
}

declare module '*.svg' {
    const value: any;
    export default value;
}

declare global {
    interface Window {
        YtDlp: {
            getYtDlpPath: () => Promise<string>,
            getYtDlpFilename: () => Promise<string>,
        }
    }
}

export {};
