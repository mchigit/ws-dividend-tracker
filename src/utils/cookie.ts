const cookieDetail = {
  name: "_oauth2_access_v2",
  url: "https://my.wealthsimple.com/app/trade"
}

export async function getCookie() {
  const cookie = await chrome.cookies.get(cookieDetail)

  if (cookie) {
    const parsedCookie = JSON.parse(decodeURIComponent(cookie.value))

    const token = parsedCookie.access_token
    const tryGetPos = await fetch(
      "https://trade-service.wealthsimple.com/account/positions",
      {
        headers: {
          authorization: `Bearer ${token}`
        }
      }
    )

    if (tryGetPos.status === 401) {
      return null
    }

    if (tryGetPos.ok) {
      return cookie
    }
  }

  return null
}
