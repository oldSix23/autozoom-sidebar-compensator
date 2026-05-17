chrome.commands.onCommand.addListener(function (command) {
    if (command !== 'toggle-zoom') return;

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) return;

        var host;
        try {
            host = new URL(tabs[0].url).hostname;
        } catch (e) {
            return;
        }
        if (!host) return;

        chrome.storage.local.get({ blacklist: [] }, function (data) {
            var list = data.blacklist;
            var idx = list.indexOf(host);

            if (idx >= 0) {
                list.splice(idx, 1);
            } else {
                list.push(host);
            }

            chrome.storage.local.set({ blacklist: list });

            var isBlocked = idx >= 0;
            chrome.action.setBadgeText({
                text: isBlocked ? 'OFF' : '',
                tabId: tabs[0].id
            });
            if (!isBlocked) {
                chrome.action.setBadgeBackgroundColor({ color: '#d32f2f', tabId: tabs[0].id });
            }
        });
    });
});

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if (msg.action === 'updateBadge' && sender.tab) {
        var zoomText = msg.zoom < 100 ? String(msg.zoom) : '';
        chrome.action.setBadgeText({
            text: zoomText,
            tabId: sender.tab.id
        });
        chrome.action.setBadgeBackgroundColor({
            color: '#0078d4',
            tabId: sender.tab.id
        });
    }
});
