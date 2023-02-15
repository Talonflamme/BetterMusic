import React from 'react';
import { YtVideo } from './YouTubeSearch';
import SearchResult from './SearchResult';
import NoSearchResult from './NoSearchResult';

const SearchResults: React.FC<SearchResultsProps> = ({ searchResults, setDownload }) => {
    return (
        <div id="search-results" className="scrollable">{
            !searchResults ?
                <div id="not-searched" /> :
                searchResults.length ?
                    searchResults.map(res => <SearchResult video={res} key={res.vidId} setDownload={setDownload} />) :
                    <NoSearchResult />
        }</div>
    )
};

interface SearchResultsProps {
    searchResults: YtVideo[],
    setDownload: (url: YtVideo) => void
}

export default SearchResults;
