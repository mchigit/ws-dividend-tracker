export async function openDetailsTab() {
  const url = chrome.runtime.getURL("tabs/details.html")

  await chrome.tabs.create({
    active: true,
    url
  })
}
