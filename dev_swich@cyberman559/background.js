// Dev Switch — Background Script

/**
 * Проверяет, является ли хост dev-доменом.
 * Структура: {полноценный_домен}.{dev_domain}
 * полноценный_домен = минимум 2 уровня (например: mail.ru, stg.mail.ru)
 * dev_domain = из настроек (например: dev.ru)
 * Пример: mail.ru.dev.ru, stg.mail.ru.dev.ru
 */
function checkIsDev(hostname, devDomain) {
  if (!devDomain) return false;
  const host = hostname.toLowerCase();
  const suffix = "." + devDomain;
  
  // Хост должен заканчиваться на .devDomain
  if (!host.endsWith(suffix) && host !== devDomain) {
    return false;
  }
  
  // Если хост совпадает с devDomain — это не dev-домен, а сам dev-домен
  if (host === devDomain) {
    return false;
  }
  
  // Проверяем, что перед devDomain есть полноценный домен (минимум 2 уровня)
  // Убираем суффикс .devDomain и проверяем остаток
  const prefix = host.slice(0, host.length - suffix.length - 1); // убираем ".devDomain"
  
  // Полноценный домен = минимум 2 части через точку (например: mail.ru)
  const parts = prefix.split(".");
  return parts.length >= 2;
}

/**
 * Преобразует dev-домен в prod-домен.
 * mail.ru.dev.ru → mail.ru
 * stg.mail.ru.dev.ru → stg.mail.ru
 * (убирает .devDomain)
 */
function devToProd(hostname, devDomain) {
  const host = hostname.toLowerCase();
  const suffix = "." + devDomain;
  if (host.endsWith(suffix)) {
    return host.slice(0, host.length - suffix.length);
  }
  return hostname;
}

/**
 * Преобразует prod-домен в dev-домен.
 * mail.ru → mail.ru.dev.ru
 * stg.mail.ru → stg.mail.ru.dev.ru
 */
function prodToDev(hostname, devDomain) {
  return hostname + "." + devDomain;
}

/**
 * Обновляет иконку для активной вкладки.
 */
function updateIconForActiveTab() {
  return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].url) return;

    return browser.storage.local.get("devDomain").then((result) => {
      const devDomain = (result.devDomain || "").trim().toLowerCase();
      let iconPath;

      if (!devDomain) {
        iconPath = "icons/icon-inactive";
      } else {
        try {
          const url = new URL(tabs[0].url);
          const isDev = checkIsDev(url.hostname, devDomain);
          iconPath = isDev ? "icons/icon-active" : "icons/icon-inactive";
        } catch (e) {
          iconPath = "icons/icon-inactive";
        }
      }

      const icons = {};
      [48, 96].forEach((size) => {
        icons[size] = iconPath + "-" + size + ".png";
      });

      return browser.browserAction.setIcon({ path: icons });
    });
  });
}

/**
 * Обработчик клика по иконке.
 * Если текущий хост — dev-домен, переключает на prod.
 * Иначе — добавляет "dev." как первый субдомен.
 */
function onIconClick() {
  return browser.storage.local.get("devDomain").then((result) => {
    const devDomain = (result.devDomain || "").trim().toLowerCase();
    if (!devDomain) return;

    return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (!tabs || !tabs[0] || !tabs[0].url) return;

      const currentUrl = tabs[0].url;
      let newUrl;
      try {
        const url = new URL(currentUrl);
        const hostname = url.hostname.toLowerCase();
        const isDev = checkIsDev(hostname, devDomain);

        let newHostname;
        if (isDev) {
          // Переключаем на prod — убираем .devDomain
          newHostname = devToProd(hostname, devDomain);
        } else {
          // Переключаем на dev — добавляем .devDomain
          newHostname = prodToDev(hostname, devDomain);
        }

        url.hostname = newHostname;
        newUrl = url.toString();
      } catch (e) {
        return; // Не удалось распарсить URL
      }

      if (newUrl && newUrl !== currentUrl) {
        browser.tabs.update(tabs[0].id, { url: newUrl });
      }
    });
  });
}

// Клик по иконке
browser.browserAction.onClicked.addListener(onIconClick);

// Обновляем иконку при смене активной вкладки
browser.tabs.onActivated.addListener(() => {
  updateIconForActiveTab();
});

// Обновляем иконку при обновлении вкладки (загрузка новой страницы)
browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    // Проверяем, активна ли эта вкладка
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        updateIconForActiveTab();
      }
    });
  }
});

// Обновляем иконку при переключении окна
browser.windows.onFocusChanged.addListener(() => {
  updateIconForActiveTab();
});

// Инициализация — обновляем иконку при старте
updateIconForActiveTab();
