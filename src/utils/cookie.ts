const cookieDetail = {
  name: "_oauth2_access_v2",
  url: "https://my.wealthsimple.com/app/trade"
}

export async function getCookie() {
  const cookie = await chrome.cookies.get(cookieDetail)

  return cookie
}
