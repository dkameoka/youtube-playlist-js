async function youtube_wait_for(callback,attempts) {
    for (let i = 0;i < attempts;i++) {
        if (callback()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve,50));
    }
    return false;
}

async function youtube_playlist_add_all(playlist,limit) {
    added = 0;
    videos_buttons = document.querySelectorAll('ytd-browse[role="main"] button[aria-label="Action menu"]');
    for (let vi = videos_buttons.length - 1;vi >= 0 && added < limit;vi--) {
        videos_buttons[vi].click();

        // Wait for menu to pop-up.
        if (!await youtube_wait_for(function () {
            menu_popup = document.querySelector('ytd-menu-popup-renderer');
            return (menu_popup && menu_popup.parentElement.parentElement.style.display == '');
        },50)) {
            alert('Failed to open action menu');
            return;
        }

        // Click "Save to playlist".
        menu = document.querySelectorAll('ytd-menu-service-item-renderer');
        found: {
            for (let i = 0;i < menu.length;i++) {
                if (menu[i].innerText != 'Save to playlist') {
                    continue;
                }
                menu[i].click();
                break found;
            }
            // Button not found, so click button again to close it.
            videos_buttons[vi].click();
            continue;
        }

        // Wait for add option menu to pop-up.
        if (!await youtube_wait_for(function () {
            paper_dialog = document.querySelector('tp-yt-paper-dialog');
            return (paper_dialog && paper_dialog.style.display == '');
        },50)) {
            alert('Failed to open add option menu');
            return;
        }

        // Click checkbox for playlist
        add_option_menu = document.querySelectorAll('ytd-playlist-add-to-option-renderer');
        found: {
            for (let i = 0;i < add_option_menu.length;i++) {
                if (add_option_menu[i].innerText != playlist) {
                    continue;
                }
                checkbox = add_option_menu[i].querySelector('#checkbox');
                if (checkbox == null) {
                    continue;
                }
                if (checkbox.checked) {
                    break found;
                }
                checkbox.click();

                // Wait for check mark.
                if (!await youtube_wait_for(function () {
                    return checkbox.checked;
                },50)) {
                    alert('Failed to check checkbox');
                    return;
                }

                added++;
                break found;
            }
            alert('Could not find playlist "' + playlist + '"');
            return;
        }

        // Close the option menu.
        close = document.querySelector('ytd-add-to-playlist-renderer #close-button button');
        if (close) {
            close.click();
        }

        // Wait for add option menu to close.
        if (!await youtube_wait_for(function () {
            paper_dialog = document.querySelector('tp-yt-paper-dialog');
            return (paper_dialog && paper_dialog.style.display == 'none');
        },50)) {
            alert('Failed to open add option menu');
            return;
        }

        // Wait for playlist operation.
        await new Promise(resolve => setTimeout(resolve,500));
    }
    console.log('Added ' + added + ' videos to ' + playlist + ' playlist.');
    alert('Added ' + added + ' videos to ' + playlist + ' playlist');
}

youtube_playlist_add_all(prompt('Enter name of playlist to add to'),parseInt(prompt('Enter add limit')));
