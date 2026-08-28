// Dev URL Switch — Background Script

let devDomain = "";

/**
 * Проверяет: хост = {полноценный_домен}.{dev_domain}
 * полноценный_домен = минимум 2 уровня (mail.ru, stg.mail.ru)
 */
function checkIsDev(hostname, dDomain) {
  if (!dDomain) return false;
  const host = hostname.toLowerCase();
  const suffix = "." + dDomain;
  
  if (host === dDomain) return false;
  if (!host.endsWith(suffix)) return false;
  
  const prefix = host.slice(0, host.length - suffix.length - 1);
  return prefix.split(".").length >= 2;
}

/**
 * mail.ru.dev.ru → mail.ru
 */
function devToProd(hostname, dDomain) {
  const host = hostname.toLowerCase();
  const suffix = "." + dDomain;
  return host.endsWith(suffix) ? host.slice(0, host.length - suffix.length) : hostname;
}

/**
 * mail.ru → mail.ru.dev.ru
 */
function prodToDev(hostname, dDomain) {
  return hostname + "." + dDomain;
}

/**
 * Обновляет иконку активной вкладки.
 */
function updateIcon() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (!tabs[0] || !tabs[0].url) return;
    
    let iconPath;
    if (!devDomain) {
      iconPath = "icons/icon-inactive";
    } else {
      try {
        const url = new URL(tabs[0].url);
        iconPath = checkIsDev(url.hostname, devDomain) ? "icons/icon-active" : "icons/icon-inactive";
      } catch (e) {
        iconPath = "icons/icon-inactive";
      }
    }
    
    const icons = {};
    [48, 96].forEach((s) => { icons[s] = iconPath + "-" + s + ".png"; });
    browser.browserAction.setIcon({ path: icons });
  });
}

/**
 * Переключает dev ↔ prod.
 */
function switchDomain() {
  if (!devDomain) {
    alert("Dev Domain не настроен!\n\nОткрой: about:addons → Dev URL Switch → Параметры");
    return;
  }
  
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (!tabs[0] || !tabs[0].url) return;
    
    try {
      const url = new URL(tabs[0].url);
      const hostname = url.hostname.toLowerCase();
      const isDev = checkIsDev(hostname, devDomain);
      
      url.hostname = isDev ? devToProd(hostname, devDomain) : prodToDev(hostname, devDomain);
      browser.tabs.update(tabs[0].id, { url: url.toString() });
    } catch (e) {}
  });
}

// Загрузка настроек
browser.storage.local.get("devDomain").then((result) => {
  devDomain = (result.devDomain || "").trim().toLowerCase();
  updateIcon();
});

// Левый клик — переключение домена
browser.browserAction.onClicked.addListener(switchDomain);

// Обновление иконки
browser.tabs.onActivated.addListener(updateIcon);
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0] && tabs[0].id === tabId) updateIcon();
    });
  }
});
browser.windows.onFocusChanged.addListener(updateIcon);

// Реакция на изменение devDomain
browser.storage.onChanged.addListener((changes) => {
  if (changes.devDomain) {
    devDomain = (changes.devDomain.newValue || "").trim().toLowerCase();
    updateIcon();
  }
});
