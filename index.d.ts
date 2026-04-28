declare module '*.png' {
    const value: any;
    export default value;
}

declare module '*.svg' {
    const value: any;
    export default value;
}

declare module '*.scss' {
    const value: any;
    export default value;
}

declare global {
    interface Window {
        electronAPI: {
            invoke: (channel: string, ...args: any[]) => Promise<any>;
        }
    }
}

export {}
