// Создаём оба пункта один раз
browser.contextMenus.create({
    id: "cbm559-show-password",
    title: "Показать пароль",
    contexts: ["editable"],
    visible: false
});

browser.contextMenus.create({
    id: "cbm559-hide-password",
    title: "Скрыть как пароль",
    contexts: ["editable"],
    visible: false
});

// Срабатывает при открытии контекстного меню
browser.contextMenus.onShown.addListener(async (info, tab) => {
    try {
        const [type] = await browser.tabs.executeScript(tab.id, {
            code: `
                (function() {
                    var el = document.activeElement;
                    return el && el.tagName === 'INPUT' ? el.type : null;
                })();
            `
        });

        await browser.contextMenus.update("cbm559-show-password", { visible: type === "password" });
        await browser.contextMenus.update("cbm559-hide-password", { visible: type === "text" });
        browser.contextMenus.refresh();
    } catch (e) {
        console.warn("Нет разрешения на доступ к вкладке:", e);
    }
});

// Обработка кликов по пунктам меню
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "cbm559-show-password") {
        browser.tabs.executeScript(tab.id, {
            code: `
                var el = document.activeElement;
                if (el && el.tagName === 'INPUT' && el.type === 'password') el.type = 'text';
            `
        });
    }

    if (info.menuItemId === "cbm559-hide-password") {
        browser.tabs.executeScript(tab.id, {
            code: `
                var el = document.activeElement;
                if (el && el.tagName === 'INPUT' && el.type === 'text') el.type = 'password';
            `
        });
    }
});
