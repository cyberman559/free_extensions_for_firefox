// Site Inspector — Background Script
// Управляет иконкой в зависимости от того, на Bitrix ли текущая вкладка

const bitrixTabs = new Set();

/**
 * Устанавливает иконку для конкретной вкладки.
 */
function updateIcon(tabId) {
  const isBitrix = bitrixTabs.has(tabId);
  const iconPath = isBitrix ? "icons/icon-active" : "icons/icon-inactive";
  const icons = {};
  [48, 96].forEach((s) => { icons[s] = iconPath + "-" + s + ".png"; });
  browser.browserAction.setIcon({ path: icons, tabId: tabId });
}

// Сообщение от content-скрипта с результатом проверки
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.isBitrix === undefined || !sender.tab) return;

  const tabId = sender.tab.id;
  if (message.isBitrix) {
    bitrixTabs.add(tabId);
  } else {
    bitrixTabs.delete(tabId);
  }
  updateIcon(tabId);
});

// При переходе на новую страницу — сбрасываем иконку (content-скрипт обновит)
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    bitrixTabs.delete(tabId);
    updateIcon(tabId);
  }
});

// Очистка при закрытии вкладки
browser.tabs.onRemoved.addListener((tabId) => {
  bitrixTabs.delete(tabId);
});
