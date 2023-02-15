import React, { useEffect, useState } from 'react';
import SearchIcon from '../../icons/SearchIcon';
import DownloadVideoWizard from './DownloadVideoWizard';
import SearchResults from './SearchResults';
import { search, YtVideo } from './YouTubeSearch';

const DownloadPage: React.FC<DownloadPageProps> = (props) => {
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<YtVideo[]>(null);
    const [downloadVideo, setDownloadVideo] = useState<YtVideo>(null);

    const onSearchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(evt.target.value);
    }

    const onSend = () => {
        const term = query.trim();
        if (!term) return; // if only whitespace
        search(term).then(setSearchResults);
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") return;
        onSend();
    }

    useEffect(() => { // todo
        setQuery("a");
        setTimeout(() => {
            const img = document.querySelector("#download-page .icon-wrapper") as HTMLDivElement;
            img.click();
        }, 50);
    }, []);

    useEffect(() => { // todo
        if (!searchResults?.length) return;
        if (!downloadVideo)
            setDownloadVideo(searchResults[0]);
    }, [searchResults]);

    return (
        <div id="download-page" className="flex-center" {...props}>
            <div className="input-wrapper flex-center">
                <input type="text" placeholder="Type to search.." id="search-bar" spellCheck="false" value={query} onChange={onSearchChange} onKeyDown={onKeyDown} />
                <div className="icon-wrapper flex-center" onClick={onSend}>
                    <SearchIcon id="search-icon" />
                </div>
            </div>

            <SearchResults searchResults={searchResults} setDownload={setDownloadVideo} />
            <DownloadVideoWizard video={downloadVideo} setVideo={setDownloadVideo} />
        </div>
    )
};

interface DownloadPageProps {
    style?: React.CSSProperties
}

export default DownloadPage;
