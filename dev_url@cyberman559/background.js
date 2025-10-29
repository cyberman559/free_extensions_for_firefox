browser.action.onClicked.addListener(async (tab) => {
    const { path } = await browser.storage.local.get('path');
    if (!path || !tab || !tab.url) return;

    try {
        const url = new URL(tab.url);
        const targetPath = path.startsWith('/') ? path : '/' + path;

        if (url.pathname.startsWith(targetPath)) {
            // убрать подставку
            url.pathname = url.pathname.replace(targetPath, '') || '/';
        } else {
            // добавить подставку
            if (url.pathname.endsWith('/')) {
                url.pathname = url.pathname + targetPath.replace(/^\//, '');
            } else {
                url.pathname = url.pathname + targetPath;
            }
        }

        await browser.tabs.update(tab.id, { url: url.toString() });
    } catch (e) {
        console.error('Ошибка обработки URL:', e);
    }
});
