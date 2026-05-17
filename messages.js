var MESSAGES = {
    'zh': {
        title: 'AutoZoom',
        subtitle: '智能补偿侧边栏宽度，自动缩放页面完整显示',
        enable: '启用缩放补偿',
        manualNotice: '检测到手动缩放，自动补偿已暂停',
        restoreBtn: '恢复自动补偿',
        browserWidth: '浏览器宽度',
        pageWidth: '页面宽度',
        sidebarWidth: '侧栏宽度',
        currentZoom: '当前缩放',
        statusLabel: '状态',
        statusNormal: '正常',
        statusPaused: '已暂停(手动缩放)',
        blacklistTitle: '当前站点黑名单',
        addToBlacklist: '将 {host} 加入黑名单',
        removeFromBlacklist: '将 {host} 从黑名单移除',
        emptyBlacklist: '黑名单为空，所有站点均会缩放',
        noAccess: '无法获取',
        likeIt: '觉得好用？',
        buyCoffee: '请作者喝杯咖啡',
        thanks: '感谢支持',
        scanHint: '扫码请作者喝杯咖啡，金额随意',
        wechat: '微信',
        alipay: '支付宝',
        qrPlaceholder: '请将收款码图片放入扩展目录'
    },
    'en': {
        title: 'AutoZoom',
        subtitle: 'Auto-scale pages to fit viewport when sidebar/vertical tabs are open',
        enable: 'Enable zoom compensation',
        manualNotice: 'Manual zoom detected, auto-zoom paused',
        restoreBtn: 'Restore auto-zoom',
        browserWidth: 'Browser width',
        pageWidth: 'Page width',
        sidebarWidth: 'Sidebar width',
        currentZoom: 'Current zoom',
        statusLabel: 'Status',
        statusNormal: 'Active',
        statusPaused: 'Paused (manual zoom)',
        blacklistTitle: 'Site blacklist',
        addToBlacklist: 'Block {host}',
        removeFromBlacklist: 'Unblock {host}',
        emptyBlacklist: 'No blocked sites — zoom applies everywhere',
        noAccess: 'N/A',
        likeIt: 'Like this extension?',
        buyCoffee: 'Buy me a coffee',
        thanks: 'Thank you!',
        scanHint: 'Any amount is appreciated',
        wechat: 'WeChat',
        alipay: 'Alipay',
        qrPlaceholder: 'Place QR code images in the extension folder'
    }
};

function getLang() {
    var lang = (navigator.language || 'en').toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
    return 'en';
}

function t(key) {
    var lang = getLang();
    return (MESSAGES[lang] && MESSAGES[lang][key]) || (MESSAGES['en'][key]) || key;
}

function tReplace(key, vars) {
    var text = t(key);
    for (var k in vars) {
        text = text.replace('{' + k + '}', vars[k]);
    }
    return text;
}
