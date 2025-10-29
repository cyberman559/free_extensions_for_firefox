browser.contextMenus.create({
    id: "lccbm559-9b4a-4d6f-bb9b-6f9c9c0a9b9c",
    title: "Показать пароль",
    contexts: ["editable"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "lccbm559-9b4a-4d6f-bb9b-6f9c9c0a9b9c") {
        const code = `
            if (document.activeElement && document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'password') {
                document.activeElement.type = 'text';
            }
        `;

        browser.tabs.executeScript(tab.id, {
            code: code
        });
    }
});