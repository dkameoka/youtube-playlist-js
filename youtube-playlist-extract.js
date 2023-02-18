function youtube_playlist_is_broken() {
    try {
        playlistVideoListRenderer = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;
        playlistId = new URLSearchParams(window.location.search).entries().next().value[1];
        if (playlistVideoListRenderer.playlistId != playlistId) {
            throw true;
        }
        videos = playlistVideoListRenderer.contents;
    } catch (error) {
        console.log('Refresh page to load ytInitialData');
        return true;
    }
    for (let vi = 0;vi < videos.length;vi++) {
        index = vi + 1;
        if ('continuationItemRenderer' in videos[vi]) {
            continue;
        }
        video_index = videos[vi].playlistVideoRenderer.index.simpleText || videos[vi].playlistVideoRenderer.index.runs[0].text;
        if (video_index != index.toString()) {
            console.log('youtube_playlist_is_broken(): Index ' + video_index + ' is not ' + index +
                ' for "' + videos[vi].playlistVideoRenderer.title.runs[0].text + '"');
            return true;
        }
    }
    return false;
}

function youtube_playlist_extract() {
    // Detect YouTube's playlist-disappearing-videos
    if (youtube_playlist_is_broken()) {
        return;
    }

    videos = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;

    // Check if list is not fully loaded
    for (let vi = 0;vi < videos.length;vi++) {
        if (typeof videos[vi].continuationItemRenderer != 'undefined') {
            console.log('Scroll to the bottom of the playlist and re-run this script');
            return;
        }
    }

    // Print the URLs
    count = 0;
    urls = '';
    for (let vi = 0;vi < videos.length;vi++) {
        count += 1;
        videoId = videos[vi].playlistVideoRenderer.videoId;
        urls += 'https://www.youtube.com/watch?v=' + videoId + '\n';
    }
    console.log('########## START ##########');
    console.log(urls);
    console.log('########## END ##########');
    console.log('Extracted ' + count + ' URLs from playlist.');
}

youtube_playlist_extract();
