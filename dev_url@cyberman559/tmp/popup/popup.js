document.addEventListener('DOMContentLoaded', async () => {
    const input = document.getElementById('pathInput');
    const { path } = await browser.storage.local.get('path');
    if (path) input.value = path;

    document.getElementById('saveBtn').addEventListener('click', async () => {
        await browser.storage.local.set({ path: input.value.trim() });
        window.close();
    });
});
