import React from "react";


export type Song = {
    title: string,
    artist: string,
    src: string
    imagePath: string,
};

export const NULL_SONG: Song = {
    title: null,
    artist: null,
    src: null,
    imagePath: null
};

export const SongContext = React.createContext<Song>(NULL_SONG);
