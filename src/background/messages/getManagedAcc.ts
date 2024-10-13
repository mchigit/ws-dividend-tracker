import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { Position } from "~types"
import { getCookie } from "~utils/cookie"
import {
  getAllAccountFiniancials,
  getManagedAccountPositions
} from "~utils/graphql"
import storage from "~utils/storage"
import { getAllDividends } from "~utils/trade"
import { formatAllAccFiniancialData } from "~utils/wealthsimple"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedManagedAcc = await storage.get("getManagedAcc")
    // const storedManagedAcc = null
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

    // const allAccFiniancials = await wsClient.getAllAccountFiniancials()
    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token
    const identityId = decodedAuthCookie.identity_canonical_id

    const allAccFiniancials = await getAllAccountFiniancials(
      accessToken,
      identityId
    )
    const formattedAccFiniancials =
      formatAllAccFiniancialData(allAccFiniancials)

    const managedAccs = formattedAccFiniancials.filter((acc) =>
      acc.unifiedAccountType.toLowerCase().includes("managed")
    )

    const allPositions = await Promise.all(
      managedAccs.map(async (acc) => {
        return await getManagedAccountPositions(accessToken, acc.id)
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
      dividends: stockWithDiv,
      createdAt: new Date().getTime()
    })

    res.send({
      dividends: stockWithDiv,
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
