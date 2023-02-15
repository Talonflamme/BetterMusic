import fs from 'fs';

type Thumbnail = {
    url: string,
    width: number,
    height: number
}

type ParsedVid = {
    vidId: string,
    title: string,
    thumbnailList: Thumbnail[],
    channel: string,
    channelThumbnailList: Thumbnail[],
    length: string,
    views: string,
    releaseDate: string
}

export type YtVideo = Omit<ParsedVid, 'thumbnailList' | 'channelThumbnailList'> & {
    thumbnail: string,
    channelThumbnail: string
}

export function search(query: string): Promise<YtVideo[]> {
    const data = '{context:{client:{clientName:"WEB",clientVersion:"2.20200720.00.02"}}}';
    const endpoint = `https://www.youtube.com/youtubei/v1/search?query=${encodeURIComponent(query)}key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&contentCheckOk=True&racyCheckOk=True`;
    const headers = {
        'Content-Type': 'application/json'
    };
    return new Promise((resolve, reject) => {
        setTimeout(reject, 5000); // 5 seconds timeout

        fetch(endpoint, {
            method: 'POST',
            headers,
            body: data
        }).then(resp => resp.json())
            .then(res => {
                let section: any[];
                try {
                    section = res['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'];
                } catch (err) {
                    section = res['onResponseReceivedCommands'][0]['appendContinuationItemsAction']['continuationItems'];
                }

                const itemRenderer = section.reduce((a, b) => a ?? b["itemSectionRenderer"], null);
                const rawVideoList: any[] = itemRenderer['contents'];
                const videos: ParsedVid[] = [];
                for (const videoDetails of rawVideoList) {
                    // Skip over ads
                    if (videoDetails.searchPyvRenderer?.ads) {
                        continue;
                    }

                    // Skip "recommended" type videos e.g. "people also watched" and "popular X"
                    //  that break up the search results
                    if ('shelfRenderer' in videoDetails) {
                        continue;
                    }

                    // Skip auto-generated "mix" playlist results
                    if ('radioRenderer' in videoDetails) {
                        continue;
                    }

                    // Skip playlist results
                    if ('playlistRenderer' in videoDetails) {
                        continue;
                    }

                    // Skip channel results
                    if ('channelRenderer' in videoDetails) {
                        continue;
                    }

                    // Skip 'people also searched for' results
                    if ('horizontalCardListRenderer' in videoDetails) {
                        continue;
                    }

                    // Can't seem to reproduce, probably related to typo fix suggestions
                    if ('didYouMeanRenderer' in videoDetails) {
                        continue;
                    }

                    // Seems to be the renderer used for the image shown on a no results page
                    if ('backgroundPromoRenderer' in videoDetails) {
                        continue;
                    }

                    const video = videoDetails.videoRenderer;
                    if (!video) {
                        console.error(videoDetails);
                        continue;
                    }

                    const views = video.viewCountText?.simpleText;
                    if (views === undefined) {
                        continue;
                    }

                    const vidId = video.videoId;
                    const title = video.title.runs[0].text;
                    const thumbnails = video.thumbnail.thumbnails;
                    const channel = video.ownerText.runs[0].text;
                    const channelThumbnails = video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails;
                    const length = video.lengthText.simpleText;
                    const releaseDate = video.publishedTimeText.simpleText;

                    videos.push({ vidId, title, thumbnailList: thumbnails, channel, channelThumbnailList: channelThumbnails, length, views, releaseDate });
                }
                resolve(videos.map(vid => chooseThumbnails(vid)));
            })

    });
}


function chooseThumbnails(vid: ParsedVid): YtVideo {
    function getThumbnail(list: Thumbnail[], minWidth: number, minHeight: number): string {
        for (const t of list) {
            if (t.width >= minWidth && t.height >= minHeight)
                return t.url;
        }
        return list[list.length - 1].url; // choose last (highest resolution) thumbnail
    }

    return {
        vidId: vid.vidId,
        channel: vid.channel,
        length: vid.length,
        title: vid.title,
        views: vid.views,
        releaseDate: vid.releaseDate,
        thumbnail: getThumbnail(vid.thumbnailList, 320, 180),
        channelThumbnail: getThumbnail(vid.channelThumbnailList, 64, 64)
    };
}
