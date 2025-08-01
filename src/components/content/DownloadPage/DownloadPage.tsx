import React, { useEffect, useState } from 'react';
import SearchIcon from '../../icons/SearchIcon';
import DownloadVideoWizard from './DownloadVideoWizard';
import SearchResults from './SearchResults';
import { search, YtVideo } from './YouTubeSearch';

const DownloadPage: React.FC<DownloadPageProps> = ({ reloadFiles, ...props }) => {
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

    return (
        <div id="download-page" className="flex-center" {...props}>
            <div className="input-wrapper flex-center">
                <input type="text" placeholder="Type to search.." id="search-bar" spellCheck="false" value={query} onChange={onSearchChange} onKeyDown={onKeyDown} />
                <div className="icon-wrapper flex-center" onClick={onSend}>
                    <SearchIcon id="search-icon" />
                </div>
            </div>

            <SearchResults searchResults={searchResults} setDownload={setDownloadVideo} />
            <DownloadVideoWizard video={downloadVideo} setVideo={setDownloadVideo} reloadFiles={reloadFiles} />
        </div>
    )
};

interface DownloadPageProps {
    reloadFiles: () => void
}

export default DownloadPage;
