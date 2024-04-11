import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import storage from "~utils/storage"
import { WealthSimpleClient } from "~utils/wealthsimple"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedManagedAcc = await storage.get("getManagedAcc")
    const cookie = await getCookie()

    if (!cookie) {
      if (storedManagedAcc) {
        return res.send(storedManagedAcc)
      }

      res.send({
        cookie: null
      })
      return
    }

    if (storedManagedAcc) {
      const { createdAt } = storedManagedAcc as any

      if (createdAt + 600000 > new Date().getTime()) {
        res.send(storedManagedAcc)
        return
      }
    }

    const wsClient = new WealthSimpleClient(cookie.value)

    const allAccFiniancials = await wsClient.getAllAccountFiniancials()

    const managedAccs = allAccFiniancials.filter((acc) =>
      acc.unifiedAccountType.includes("MANAGED")
    )

    const allPositions = await Promise.all(
      managedAccs.map(async (acc) => {
        return await wsClient.getManagedAccountPositions(acc.id)
      })
    )

    await storage.set("getManagedAcc", {
      allPositions,
      createdAt: new Date().getTime()
    })

    res.send({
      allPositions,
      createdAt: new Date().getTime()
    })

    // const allAcc = await wsClient.getAllAccountFiniancials()

    // const tradePositions = await getTradePositions(accessToken)

    // const formattedPositions = tradePositions.map((position: any) => {
    //   return {
    //     currency: position.currency,
    //     stock: position.stock,
    //     quantity: position.quantity,
    //     account_id: position.account_id
    //   }
    // })

    // const dividends = await getAllDividends(formattedPositions)

    // await storage.set("tradePositionsWithDiv", {
    //   activities,
    //   createdAt: new Date().getTime()
    // })

    // res.send({
    //   activities,
    //   createdAt: new Date().getTime()
    // })
  } catch (error) {
    console.error("Failed to handle", error)
    res.send({
      error: error
    })
  }
}

export default handler
