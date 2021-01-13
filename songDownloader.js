function f6cf___INITIAL_STATE___getRevisionId() {
    let revisionIdFromUrl = window.location.pathname.match(/r[0-9]+$/);
    if (revisionIdFromUrl)
        revisionIdFromUrl = revisionIdFromUrl[0];
    let revisionIdFromState = window.__STATE__ && window.__STATE__.data && window.__STATE__.data.meta && window.__STATE__.data.meta.revisionId;
    let revisionIdForOldSongsterr = document.head.innerHTML.toString().match(/revision=([0-9]+)/);
    if (revisionIdForOldSongsterr)
        revisionIdForOldSongsterr = revisionIdForOldSongsterr[1];
    let revisionIdForNewSongsterr = document.body.innerHTML.toString().match(/"revisionId":([0-9]+)/);
    if (revisionIdForNewSongsterr)
        revisionIdForNewSongsterr = revisionIdForNewSongsterr[1];
    let revisionId = revisionIdFromUrl || revisionIdFromState || revisionIdForOldSongsterr || revisionIdForNewSongsterr;
    return revisionId;
}

function f6cf___INITIAL_STATE___download() {
    let revisionId = f6cf___INITIAL_STATE___getRevisionId();
    if (!revisionId) {
        alert('Couldn\'t get song revision id!');
        return;
    }
    let apiUrl = `https://www.songsterr.com/a/ra/player/songrevision/${revisionId}.xml`;
    fetch(apiUrl).then(res => res.text()).then(data => {
        let url = data.match(/<attachmentUrl>(.+?.gp[t54x])<\/attachmentUrl>/);
        if (!url) {
            alert('Couldn\'t find download url!');
            return;
        } else {
            url = [...url].slice(1);
        }
        let title = data.match(/<title>(.+?)<\/title>/);
        title = title ? title[1] : 'Unknown title';
        let artist = data.match(/<name>(.+?)<\/name>/);
        artist = artist ? artist[1] : 'Unknown artist';

        for (let urlVariant of url) {
            let format = urlVariant.split('.').slice(-1)[0];
            let name = `${artist} - ${title}.${format}`;
            fetch(urlVariant).then(res => res.blob()).then(blob => {
                var a = new FileReader();
                a.onload = e => {
                    downloadURI(e.target.result, name);
                }
                a.readAsDataURL(blob);
            }).catch(e => {
                downloadURI(urlVariant, name);
            })
        }
    });

    function downloadURI(url, name) {
        let link = document.createElement('a');
        link.download = name;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

if (this.chrome && this.chrome.browserAction) {
    function f6cf___INITIAL_STATE___bootstrapDownloader() {
        let revisionId = f6cf___INITIAL_STATE___getRevisionId();
        if (revisionId) {
            f6cf___INITIAL_STATE___download();
        } else {
            let patcher = document.createElement("script");
            patcher.innerHTML =
                f6cf___INITIAL_STATE___getRevisionId + ';' + f6cf___INITIAL_STATE___download + ";f6cf___INITIAL_" + "STATE___download()";
            (document.head || document.documentElement).appendChild(patcher);
        }
    }
    chrome.browserAction.onClicked.addListener(tab => {
        chrome.tabs.executeScript({
            code: f6cf___INITIAL_STATE___getRevisionId + ';' + f6cf___INITIAL_STATE___download + ';' + f6cf___INITIAL_STATE___bootstrapDownloader + ';f6cf___INITIAL_STATE___bootstrapDownloader()'
        });
    });
    const displayDownloadSongActionOnSongsterr = {
        conditions: [
            new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostContains: 'songsterr.com' }
            })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
    };
    chrome.runtime.onInstalled.addListener((details) => {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
            chrome.declarativeContent.onPageChanged.addRules([displayDownloadSongActionOnSongsterr])
        })
    });
} else {
    let button = document.createElement('button');
    button.innerText = 'Download this song';
    button.style = 'position: absolute; right: 0; top: 0';
    button.onclick = f6cf___INITIAL_STATE___download;
    document.body.appendChild(button);
}