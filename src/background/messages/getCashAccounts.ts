import type { PlasmoMessaging } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import {
  getAllAccountFiniancials,
  getCashAccountInterestRate
} from "~utils/graphql"
import storage from "~utils/storage"

const getCashAccountData = async (
  allAccFiniancials: any,
  accessToken: string
) => {
  try {
    const cashAccounts =
      allAccFiniancials?.data?.identity?.accounts?.edges?.filter(
        (account: any) => account?.node?.id?.includes("ca-cash")
      )

    if (!cashAccounts || cashAccounts.length === 0) {
      return null
    }

    const cashAccountsData = await Promise.all(
      cashAccounts.map(async (account) => {
        const balance =
          account?.node?.financials?.currentCombined?.netLiquidationValue
        const cashAccountId = account?.node?.id

        const interestRate = await getCashAccountInterestRate(
          cashAccountId,
          accessToken
        )

        return {
          balance,
          interestRate,
          accInfo: account?.node
        }
      })
    )

    return cashAccountsData
  } catch (error) {
    console.error("Error in getCashAccountData:", error)
    return null
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message to get cash accounts:", req)

  try {
    const storedData = await storage.get("ws-cash-accounts")

    const cookie = await getCookie()

    if (!cookie) {
      if (storedData) {
        return res.send(storedData)
      }

      res.send({
        error: "No Cookie",
        cashAccounts: null
      })
      return
    }

    if (storedData) {
      const { createdAt } = storedData as any

      // Use 10-minute cache like getAllAccountDivs
      if (createdAt + 600000 > new Date().getTime()) {
        res.send(storedData)
        return
      }
    }

    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token
    const identityId = decodedAuthCookie.identity_canonical_id

    const allAccFiniancials = await getAllAccountFiniancials(
      accessToken,
      identityId
    )

    const cashData = await getCashAccountData(allAccFiniancials, accessToken)

    const dataToStore = {
      cashAccounts: cashData,
      createdAt: new Date().getTime()
    }

    await storage.set("ws-cash-accounts", dataToStore)

    res.send(dataToStore)
  } catch (error) {
    console.error("Error in getCashAccounts:", error)
    res.send({
      error: "Error in getCashAccounts",
      cashAccounts: null
    })
  }
}

export default handler
