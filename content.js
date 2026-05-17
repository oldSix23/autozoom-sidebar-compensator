
(function () {
    'use strict';

    var NORMAL_CHROME_WIDTH = 32;
    var MIN_ZOOM = 0.75;
    var DEBOUNCE_MS = 200;
    var enabled = true;
    var blacklist = [];
    var manualZoomPaused = false;
    var initialDPR = window.devicePixelRatio;
    var host = location.hostname;
    var pausedKey = 'paused_' + host;
    var transitionApplied = false;

    function isBlacklisted() {
        return blacklist.indexOf(host) >= 0;
    }

    function calcZoom() {
        var outer = window.outerWidth;
        var inner = window.innerWidth;
        var sidebarWidth = outer - inner - NORMAL_CHROME_WIDTH;

        if (sidebarWidth <= 10) {
            return 1;
        }

        var zoom = inner / (inner + sidebarWidth);
        return Math.max(zoom, MIN_ZOOM);
    }

    function ensureTransition() {
        if (!transitionApplied && document.documentElement) {
            document.documentElement.style.transition = 'zoom 0.25s ease';
            transitionApplied = true;
        }
    }

    function notifyBadge(zoom) {
        try {
            chrome.runtime.sendMessage({ action: 'updateBadge', zoom: zoom, host: host });
        } catch (e) {}
    }

    function applyZoom() {
        ensureTransition();

        if (!enabled || isBlacklisted() || manualZoomPaused) {
            document.documentElement.style.zoom = '';
            notifyBadge(100);
            return;
        }

        var zoom = calcZoom();
        if (zoom < 0.99) {
            document.documentElement.style.zoom = zoom;
            notifyBadge(Math.round(zoom * 100));
        } else {
            document.documentElement.style.zoom = '';
            notifyBadge(100);
        }
    }

    function setManualZoomPaused(paused) {
        manualZoomPaused = paused;
        var data = {};
        data[pausedKey] = paused;
        chrome.storage.local.set(data);
        applyZoom();
    }

    function checkManualZoom() {
        var currentDPR = window.devicePixelRatio;
        if (Math.abs(currentDPR - initialDPR) > 0.01 && !manualZoomPaused) {
            setManualZoomPaused(true);
        }
    }

    function loadSettingsAndApply() {
        var keys = { enabled: true, blacklist: [] };
        keys[pausedKey] = false;
        chrome.storage.local.get(keys, function (data) {
            enabled = data.enabled;
            blacklist = data.blacklist;
            manualZoomPaused = data[pausedKey];
            applyZoom();
        });
    }

    var timer = null;
    window.addEventListener('resize', function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            checkManualZoom();
            if (!manualZoomPaused) {
                applyZoom();
            }
        }, DEBOUNCE_MS);
    });

    if (document.documentElement) {
        loadSettingsAndApply();
    } else {
        var observer = new MutationObserver(function () {
            if (document.documentElement) {
                observer.disconnect();
                loadSettingsAndApply();
            }
        });
        observer.observe(document, { childList: true });
    }

    document.addEventListener('DOMContentLoaded', function () {
        loadSettingsAndApply();
    });

    chrome.storage.onChanged.addListener(function (changes) {
        if (changes.enabled) {
            enabled = changes.enabled.newValue;
        }
        if (changes.blacklist) {
            blacklist = changes.blacklist.newValue;
        }
        if (changes[pausedKey]) {
            manualZoomPaused = changes[pausedKey].newValue;
            if (!manualZoomPaused) {
                initialDPR = window.devicePixelRatio;
            }
        }
        applyZoom();
    });
})();
