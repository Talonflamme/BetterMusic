import React from 'react';
import { YtVideo } from './YouTubeSearch';
import SearchResult from './SearchResult';
import NoSearchResult from './NoSearchResult';

const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, setDownload, setPreview }) => {
    return (
        <div id="search-results" className="scrollable">{
            !searchResults ?
                <div id="not-searched" /> :
                searchResults.length ?
                    searchResults.map(res => <SearchResult video={res} key={res.vidId} setDownload={setDownload} setPreview={setPreview} />) :
                    <NoSearchResult />
        }</div>
    )
};

interface SearchResultsProps {
    searchResults: YtVideo[],
    setDownload: (url: YtVideo) => void,
    setPreview: (vid: YtVideo) => void,
}

export default SearchResults;
