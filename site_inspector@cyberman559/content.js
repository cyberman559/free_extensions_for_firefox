// Site Inspector — Content Script
// Проверяет, работает ли сайт на Bitrix, и сообщает результат в background

function isBitrix() {
  // 1. Проверка window.BX через wrappedJSObject (Firefox)
  try {
    if (typeof window.wrappedJSObject.BX !== "undefined") return true;
  } catch (e) {}

  // 2. Проверка путей /bitrix/ в script[src] и link[href]
  const elements = document.querySelectorAll("script[src], link[href]");
  for (const el of elements) {
    const url = el.src || el.href;
    if (url && url.includes("/bitrix/")) return true;
  }

  // 3. Проверка inline-скриптов на BX.message или BX(
  const inlineScripts = document.querySelectorAll("script:not([src])");
  for (const script of inlineScripts) {
    const text = script.textContent;
    if (text.includes("BX.message") || text.includes("BX(")) return true;
  }

  // 4. Проверка meta generator
  const meta = document.querySelector('meta[name="generator"]');
  if (meta && meta.content && meta.content.toLowerCase().includes("bitrix")) return true;

  return false;
}

// Отправляем результат в background
try {
  browser.runtime.sendMessage({ isBitrix: isBitrix() });
} catch (e) {}
