
(function () {
    // i18n: apply translations to all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
        el.textContent = t(el.getAttribute('data-i18n'));
    });

    var enableToggle = document.getElementById('enableToggle');
    var toggleBlacklistBtn = document.getElementById('toggleBlacklist');
    var blacklistTagsEl = document.getElementById('blacklistTags');
    var emptyHintEl = document.getElementById('emptyHint');
    var outerWidthEl = document.getElementById('outerWidth');
    var innerWidthEl = document.getElementById('innerWidth');
    var sidebarWidthEl = document.getElementById('sidebarWidth');
    var zoomLevelEl = document.getElementById('zoomLevel');
    var statusTextEl = document.getElementById('statusText');
    var manualZoomNotice = document.getElementById('manualZoomNotice');
    var resetManualZoomBtn = document.getElementById('resetManualZoom');

    var currentHost = '';
    var currentTabId = null;
    var blacklist = [];
    var pausedKey = '';

    function loadSettings() {
        var keys = { enabled: true, blacklist: [] };
        if (pausedKey) keys[pausedKey] = false;

        chrome.storage.local.get(keys, function (data) {
            enableToggle.checked = data.enabled;
            blacklist = data.blacklist;
            renderBlacklist();
            updateBlacklistBtn();

            if (pausedKey && data[pausedKey]) {
                manualZoomNotice.style.display = 'block';
                statusTextEl.textContent = t('statusPaused');
                statusTextEl.style.color = '#856404';
            } else {
                manualZoomNotice.style.display = 'none';
                statusTextEl.textContent = t('statusNormal');
                statusTextEl.style.color = '#1a1a1a';
            }
        });
    }

    function renderBlacklist() {
        blacklistTagsEl.innerHTML = '';
        if (blacklist.length === 0) {
            emptyHintEl.style.display = 'block';
            return;
        }
        emptyHintEl.style.display = 'none';
        blacklist.forEach(function (host) {
            var tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerHTML = host + '<span class="remove" data-host="' + host + '">&times;</span>';
            blacklistTagsEl.appendChild(tag);
        });

        blacklistTagsEl.querySelectorAll('.remove').forEach(function (el) {
            el.addEventListener('click', function () {
                var h = this.getAttribute('data-host');
                blacklist = blacklist.filter(function (x) { return x !== h; });
                chrome.storage.local.set({ blacklist: blacklist });
                renderBlacklist();
                updateBlacklistBtn();
            });
        });
    }

    function updateBlacklistBtn() {
        if (!currentHost) {
            toggleBlacklistBtn.style.display = 'none';
            return;
        }
        toggleBlacklistBtn.style.display = 'block';
        if (blacklist.indexOf(currentHost) >= 0) {
            toggleBlacklistBtn.textContent = tReplace('removeFromBlacklist', { host: currentHost });
            toggleBlacklistBtn.className = 'btn btn-danger';
        } else {
            toggleBlacklistBtn.textContent = tReplace('addToBlacklist', { host: currentHost });
            toggleBlacklistBtn.className = 'btn';
        }
    }

    enableToggle.addEventListener('change', function () {
        chrome.storage.local.set({ enabled: enableToggle.checked });
    });

    toggleBlacklistBtn.addEventListener('click', function () {
        var idx = blacklist.indexOf(currentHost);
        if (idx >= 0) {
            blacklist.splice(idx, 1);
        } else {
            blacklist.push(currentHost);
        }
        chrome.storage.local.set({ blacklist: blacklist });
        renderBlacklist();
        updateBlacklistBtn();
    });

    resetManualZoomBtn.addEventListener('click', function () {
        if (!pausedKey) return;
        var data = {};
        data[pausedKey] = false;
        chrome.storage.local.set(data);
        manualZoomNotice.style.display = 'none';
        statusTextEl.textContent = t('statusNormal');
        statusTextEl.style.color = '#1a1a1a';
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) return;
        var tab = tabs[0];
        currentTabId = tab.id;

        try {
            var url = new URL(tab.url);
            currentHost = url.hostname;
            pausedKey = 'paused_' + currentHost;
        } catch (e) {
            currentHost = '';
        }

        updateBlacklistBtn();
        loadSettings();

        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function () {
                return {
                    outerWidth: window.outerWidth,
                    innerWidth: window.innerWidth,
                    zoom: document.documentElement.style.zoom || '1'
                };
            }
        }, function (results) {
            if (!results || !results[0] || !results[0].result) {
                outerWidthEl.textContent = t('noAccess');
                innerWidthEl.textContent = t('noAccess');
                sidebarWidthEl.textContent = t('noAccess');
                zoomLevelEl.textContent = t('noAccess');
                return;
            }
            var data = results[0].result;
            var sidebar = data.outerWidth - data.innerWidth - 32;
            outerWidthEl.textContent = data.outerWidth + 'px';
            innerWidthEl.textContent = data.innerWidth + 'px';
            sidebarWidthEl.textContent = Math.max(0, sidebar) + 'px';
            var zoomVal = parseFloat(data.zoom);
            zoomLevelEl.textContent = (zoomVal * 100).toFixed(1) + '%';
        });
    });

    // 赞赏弹窗
    var donateLink = document.getElementById('donateLink');
    var donateModal = document.getElementById('donateModal');
    var donateOverlay = document.getElementById('donateOverlay');
    var donateClose = document.getElementById('donateClose');
    var qrImage = document.getElementById('qrImage');
    var qrPlaceholder = document.getElementById('qrPlaceholder');
    var donateTabs = document.querySelectorAll('.donate-tab');
    var currentQrTab = 'wechat';
    qrPlaceholder.textContent = t('qrPlaceholder');

    function showQr(type) {
        currentQrTab = type;
        donateTabs.forEach(function (el) {
            el.classList.toggle('active', el.getAttribute('data-tab') === type);
        });
        var src = 'icons/' + type + '_qr.png';
        var img = new Image();
        img.onload = function () {
            qrImage.src = src;
            qrImage.style.display = 'block';
            qrPlaceholder.style.display = 'none';
        };
        img.onerror = function () {
            qrImage.style.display = 'none';
            qrPlaceholder.style.display = 'block';
        };
        img.src = src;
    }

    donateLink.addEventListener('click', function (e) {
        e.preventDefault();
        donateModal.style.display = 'block';
        showQr(currentQrTab);
    });

    donateClose.addEventListener('click', function () {
        donateModal.style.display = 'none';
    });

    donateOverlay.addEventListener('click', function () {
        donateModal.style.display = 'none';
    });

    donateTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            showQr(this.getAttribute('data-tab'));
        });
    });
})();
