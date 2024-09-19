import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { CashAccountInterest } from "~types"
import { getCookie } from "~utils/cookie"
import {
  getCashAccountIdentity,
  getCashIdentity,
  getCashPastInterests
} from "~utils/graphql"
import storage from "~utils/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedCashInterests = await storage.get("cashInterests")
    const cookie = await getCookie()

    if (!cookie) {
      if (storedCashInterests) {
        return res.send(storedCashInterests)
      }

      res.send({
        cookie: null
      })
      return
    }

    if (storedCashInterests) {
      const { createdAt } = storedCashInterests as any

      if (createdAt + 600000 > new Date().getTime()) {
        return res.send(storedCashInterests)
      }
    }

    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token
    const profiles = decodedAuthCookie.profiles

    const cashIdentity = await getCashIdentity(
      profiles.invest.default,
      accessToken
    )

    const identityId = cashIdentity.profile.identity_id

    const cashAccountIdentity = await getCashAccountIdentity(
      identityId,
      accessToken
    )

    const cashAccountId = cashAccountIdentity?.accounts?.edges[0]?.node?.id

    if (!cashAccountId) {
      res.send({
        error: "No cash account found"
      })
      return
    }

    const cashInterests = await getCashPastInterests(accessToken, cashAccountId)

    const formattedCashInterests: CashAccountInterest[] =
      cashInterests?.data?.activityFeedItems?.edges.map((edge) => {
        return {
          amount: edge.node.amount as string,
          occurredAt: edge.node.occurredAt as string,
          currency: edge.node.currency as string
        }
      })

    await storage.set("cashInterests", {
      formattedCashInterests,
      createdAt: new Date().getTime()
    })

    res.send({
      formattedCashInterests,
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
