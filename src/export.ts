export async function openExportTab() {
  const url = chrome.runtime.getURL("tabs/export.html")

  await chrome.tabs.create({
    active: true,
    url
  })
}
