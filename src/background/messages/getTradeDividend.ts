import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import storage from "~utils/storage"
import { getAllDividends, getTradePositions } from "~utils/trade"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const cookie = await getCookie()
    if (!cookie) {
      res.send({
        cookie: null
      })
      return
    }

    const storedTradePositionsWithDiv = await storage.get(
      "tradePositionsWithDiv"
    )

    if (storedTradePositionsWithDiv) {
      const { createdAt } = storedTradePositionsWithDiv as any

      if (createdAt + 600000 > new Date().getTime()) {
        res.send(storedTradePositionsWithDiv)
        return
      }
    }

    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token

    const tradePositions = await getTradePositions(accessToken)

    const formattedPositions = tradePositions.map((position: any) => {
      return {
        currency: position.currency,
        stock: position.stock,
        quantity: position.quantity,
        account_id: position.account_id
      }
    })

    const dividends = await getAllDividends(formattedPositions)

    await storage.set("tradePositionsWithDiv", {
      dividends,
      createdAt: new Date().getTime()
    })

    res.send({
      dividends
    })
  } catch (error) {
    console.error("Failed to handle", error)
    res.send({
      error: error
    })
  }
}

export default handler
