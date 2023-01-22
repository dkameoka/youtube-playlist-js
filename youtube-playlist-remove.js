function youtube_playlist_is_broken() {
    try {
        playlistVideoListRenderer = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer;
        playlistId = new URLSearchParams(window.location.search).entries().next().value[1];
        if (playlistVideoListRenderer.playlistId != playlistId) {
            throw false;
        }
        videos = ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
    } catch (error) {
        alert('Refresh page to load ytInitialData');
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

async function youtube_wait_for(callback,attempts) {
    for (let i = 0;i < attempts;i++) {
        if (callback()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve,50));
    }
    return false;
}

async function youtube_playlist_remove(count) {
    deleted = 0;
    for (let c = 0;c < count;c++) {
        // Detect YouTube's playlist-disappearing-videos bug and stop.
        if (youtube_playlist_is_broken()) {
            console.log('Detected YouTube playlist bug. Refresh page.');
            alert('Detected YouTube playlist bug. Refresh page.');
            return;
        }

        // Open the first video's menu.
        first_button = document.querySelector('ytd-playlist-video-renderer button');
        if (first_button == null) {
            if (deleted == 0) {
                alert('Empty video list or not on a YouTube /playlist.');
                return;
            }
            break;
        }
        first_button.click();

        // Wait for menu to pop-up.
        if (!await youtube_wait_for(function () {
            iron_dropdown = document.querySelector('tp-yt-iron-dropdown[class="style-scope ytd-popup-container"]');
            return (iron_dropdown && iron_dropdown.style.display == '');
        },50)) {
            alert('Failed to open menu');
            return;
        }

        // Remove first video.
        menu = document.querySelectorAll('ytd-menu-popup-renderer ytd-menu-service-item-renderer');
        for (let i = 0;i < menu.length;i++) {
            if (menu[i].innerText.startsWith('Remove from ') == false) {
                continue;
            }
            menu[i].click();
            deleted++;
        }

        // Wait for playlist to re-render.
        await new Promise(resolve => setTimeout(resolve,500));
    }
    console.log('Removed ' + deleted + ' videos from playlist.');
    alert('Removed ' + deleted + ' videos from playlist.');
}

youtube_playlist_remove(parseInt(prompt('Enter number of videos to remove')));
