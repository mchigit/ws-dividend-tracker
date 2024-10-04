import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import {
  getAllAccountFiniancials,
  getCashAccountInterestRate
} from "~utils/graphql"
import storage from "~utils/storage"

const STORAGE_KEY = "cashAccountV2"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedCashAccount = await storage.get(STORAGE_KEY)
    // const storedCashAccount = null
    const cookie = await getCookie()

    if (!cookie) {
      if (storedCashAccount) {
        return res.send(storedCashAccount)
      }

      res.send({
        error: "No Cookie"
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
    const idenitityId = decodedAuthCookie.identity_canonical_id

    const allAccFiniancials = await getAllAccountFiniancials(
      accessToken,
      idenitityId
    )

    const cashAccount =
      allAccFiniancials?.data?.identity?.accounts?.edges?.find((account: any) =>
        account?.node?.id.includes("cash")
      )

    if (!cashAccount) {
      res.send({
        error: "No cash account found"
      })
      return
    }

    const balance =
      cashAccount?.node?.financials?.currentCombined?.netLiquidationValue
    const cashAccountId = cashAccount?.node?.id

    const interestRate = await getCashAccountInterestRate(
      cashAccountId,
      accessToken
    )

    await storage.set(STORAGE_KEY, {
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
