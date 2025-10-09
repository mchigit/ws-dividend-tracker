import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import { fetchIdentityPositions } from "~utils/graphql"
import storage from "~utils/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message to get identity positions:", req)

  try {
    const storedData = await storage.get("ws-identity-positions")
    // const storedData = null // For testing purposes, we are not using stored data

    const cookie = await getCookie()

    if (!cookie) {
      if (storedData) {
        return res.send(storedData)
      }

      res.send({
        error: "No Cookie",
        positions: null
      })
      return
    }

    if (storedData) {
      const { createdAt } = storedData as any

      // Use 10-minute cache like getCashAccounts
      if (createdAt + 600000 > new Date().getTime()) {
        res.send(storedData)
        return
      }
    }

    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token
    const identityId = decodedAuthCookie.identity_canonical_id

    const positionsData = await fetchIdentityPositions(accessToken, identityId)

    const dataToStore = {
      positions: positionsData,
      createdAt: new Date().getTime()
    }

    await storage.set("ws-identity-positions", dataToStore)

    res.send(dataToStore)
  } catch (error) {
    console.error("Error in getIdentityPositions:", error)
    res.send({
      error: "Error in getIdentityPositions",
      positions: null
    })
  }
}

export default handler
