const devDomainInput = document.getElementById("devDomain");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

// Загружаем сохранённое значение при открытии popup
browser.storage.local.get("devDomain").then((result) => {
  devDomainInput.value = result.devDomain || "";
});

// Сохранение
saveBtn.addEventListener("click", () => {
  const value = devDomainInput.value.trim().toLowerCase();
  browser.storage.local.set({ devDomain: value }).then(() => {
    showStatus("Сохранено!", "saved");
    updatePopupStatus();
  });
});

// Обновление статуса в popup
function updatePopupStatus() {
  browser.storage.local.get("devDomain").then((result) => {
    const devDomain = (result.devDomain || "").trim().toLowerCase();
    if (!devDomain) {
      statusEl.className = "status inactive";
      statusEl.textContent = "Dev Domain не настроен";
      return;
    }

    // Получаем host текущей вкладки
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (!tabs[0]) {
        statusEl.className = "status inactive";
        statusEl.textContent = "Нет активной вкладки";
        return;
      }

      try {
        const url = new URL(tabs[0].url);
        const currentHost = url.hostname.toLowerCase();
        const suffix = "." + devDomain;
        
        // Проверяем: хост заканчивается на .devDomain и перед ним >= 2 части
        let isDev = false;
        if (currentHost.endsWith(suffix) && currentHost !== devDomain) {
          const prefix = currentHost.slice(0, currentHost.length - suffix.length - 1);
          const parts = prefix.split(".");
          isDev = parts.length >= 2;
        }

        if (isDev) {
          statusEl.className = "status active";
          statusEl.textContent = "✅ Вы на dev-домене:\n" + currentHost;
        } else {
          statusEl.className = "status inactive";
          statusEl.textContent = "❌ Текущий домен: " + currentHost;
        }
      } catch (e) {
        statusEl.className = "status inactive";
        statusEl.textContent = "Не удалось определить домен";
      }
    });
  });
}

// Обновляем статус сразу и при каждом изменении input
updatePopupStatus();
devDomainInput.addEventListener("input", updatePopupStatus);

function showStatus(msg, type) {
  statusEl.className = "status " + type;
  statusEl.textContent = msg;
  setTimeout(() => {
    updatePopupStatus();
  }, 2000);
}
