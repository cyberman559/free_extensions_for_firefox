const devDomainInput = document.getElementById("devDomain");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

function updateStatus() {
  browser.storage.local.get("devDomain").then((result) => {
    const devDomain = (result.devDomain || "").trim().toLowerCase();
    devDomainInput.value = devDomain;
    
    if (!devDomain) {
      statusEl.className = "status inactive";
      statusEl.textContent = "Dev Domain не настроен";
      return;
    }
    
    statusEl.className = "status active";
    statusEl.textContent = "✅ Dev Domain: " + devDomain;
  });
}

saveBtn.addEventListener("click", () => {
  const value = devDomainInput.value.trim().toLowerCase();
  browser.storage.local.set({ devDomain: value }).then(() => {
    statusEl.className = "status saved";
    statusEl.textContent = "✅ Сохранено!";
  });
});

updateStatus();