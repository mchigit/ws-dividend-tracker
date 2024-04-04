import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import {
  getCashAccountBalance,
  getCashAccountIdentity,
  getCashAccountInterestRate,
  getCashIdentity
} from "~utils/graphql"
import storage from "~utils/storage"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedCashAccount = await storage.get("cashAccount")
    const cookie = await getCookie()

    if (!cookie) {
      if (storedCashAccount) {
        return res.send(storedCashAccount)
      }

      res.send({
        cookie: null
      })
      return
    }

    if (storedCashAccount) {
      const { createdAt } = storedCashAccount as any

      if (createdAt + 600000 > new Date().getTime()) {
        return res.send(storedCashAccount)
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

    const [balance, interestRate] = await Promise.all([
      getCashAccountBalance(cashAccountId, accessToken),
      getCashAccountInterestRate(cashAccountId, accessToken)
    ])

    await storage.set("cashAccount", {
      balance: balance,
      interestRate: interestRate,
      createdAt: new Date().getTime()
    })

    res.send({
      balance: balance,
      interestRate: interestRate,
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
