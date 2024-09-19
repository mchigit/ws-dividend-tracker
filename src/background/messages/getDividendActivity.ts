import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import { getDividendActivities } from "~utils/graphql"
import storage from "~utils/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedActivity = await storage.get("getDividendActivity")
    const cookie = await getCookie()

    if (!cookie) {
      if (storedActivity) {
        return res.send(storedActivity)
      }

      res.send({
        error: "No Cookie"
      })
      return
    }

    if (storedActivity) {
      const { createdAt } = storedActivity as any

      if (createdAt + 600000 > new Date().getTime()) {
        res.send(storedActivity)
        return
      }
    }

    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token

    const activities = await getDividendActivities(accessToken)

    await storage.set("tradePositionsWithDiv", {
      activities,
      createdAt: new Date().getTime()
    })

    res.send({
      activities,
      createdAt: new Date().getTime()
    })
  } catch (error) {
    console.error("Failed to handle", error)
    res.send({
      error: error
    })
  }
}

export default handler
