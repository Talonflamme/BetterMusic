import React from "react";


export type Song = {
    title: string,
    artist: string,
    src: string,
    imagePath: string,
    /**
     * PlayCommand defines if the song should be played instantly. If it is true and the song is first passed to the music player, it will be instantly played without the user having to press start.
     */
    playCommand?: boolean
};

export const NULL_SONG: Song = {
    title: null,
    artist: null,
    src: null,
    imagePath: null
};

export const SongContext = React.createContext<{ song: Song, setSong: (song: Song) => void, isPlaying: boolean, setIsPlaying: (isPlaying: boolean) => void }>({ song: NULL_SONG, setSong: null, isPlaying: false, setIsPlaying: null });
