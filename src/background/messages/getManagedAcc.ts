import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { Position } from "~types"
import { getCookie } from "~utils/cookie"
import storage from "~utils/storage"
import { getAllDividends } from "~utils/trade"
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
        error: "No Cookie"
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

    const flattedPositions = allPositions.flat()

    const allFormattedPositions: Position[] = flattedPositions
      .map((positions) => {
        return {
          stock: {
            symbol: positions.symbol,
            name: positions.name,
            primary_exchange: ""
          },
          quantity: parseFloat(positions.quantity),
          account_id: positions.id,
          currency: positions.currency,
          type: positions.type
        }
      })
      .filter((pos) => {
        if (
          pos.quantity === 0 ||
          pos.type === "currency" ||
          !pos?.stock?.symbol
        ) {
          return false
        }

        return true
      })

    const stockWithDiv = await getAllDividends(allFormattedPositions)

    await storage.set("getManagedAcc", {
      allPositions: stockWithDiv,
      createdAt: new Date().getTime()
    })

    res.send({
      allPositions: stockWithDiv,
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
