import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { Position } from "~types"
import { getCookie } from "~utils/cookie"
import {
  getAllAccountFiniancials,
  getCashAccountInterestRate,
  getManagedAccountPositions
} from "~utils/graphql"
import storage from "~utils/storage"
import { getAllDividends, getTradePositions } from "~utils/trade"
import { formatAllAccFiniancialData } from "~utils/wealthsimple"

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

const getManagedAccountData = async (
  allAccFiniancials: any,
  accessToken: string
) => {
  try {
    const formattedAccFiniancials =
      formatAllAccFiniancialData(allAccFiniancials)

    const managedAccs = formattedAccFiniancials
      .filter((acc) => acc.unifiedAccountType.toLowerCase().includes("managed"))
      .filter((acc) => !!acc.id)

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
          account_id: positions.account_id,
          currency: positions.currency,
          type: positions.type,
          sec_id: positions?.id,
          accountInfo: formattedAccFiniancials.find(
            (acc) => acc?.id === positions?.account_id
          )
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

    const stockWithDiv = await getAllDividends(
      allFormattedPositions,
      accessToken
    )

    return stockWithDiv
  } catch (error) {
    console.error("Error in getManagedAccountData:", error)
    return null
  }
}

const getTradeAccountData = async (
  allAccFiniancials: any,
  accessToken: string
) => {
  try {
    const formattedAccFiniancials =
      formatAllAccFiniancialData(allAccFiniancials)

    const tradePositions = await getTradePositions(accessToken)

    const filteredTradePositions = tradePositions.filter((pos) => {
      if (
        pos?.security_type === "option" ||
        pos?.active === false ||
        pos?.quantity === 0
      ) {
        return false
      }

      return (
        pos?.security_type === "equity" ||
        pos?.security_type === "exchange_traded_fund"
      )
    })

    const formattedPositions: Array<any> = filteredTradePositions
      .map((position: any) => {
        if (position.active) {
          const accountInfo = formattedAccFiniancials.find(
            (acc) => acc?.id === position.account_id
          )
          return {
            currency: position.currency,
            stock: position.stock,
            quantity: position.quantity,
            account_id: position.account_id,
            sec_id: position?.id,
            accountInfo: accountInfo
          }
        }
      })
      .filter(Boolean)

    const dividends = await getAllDividends(formattedPositions, accessToken)

    return dividends
  } catch (error) {
    console.error("Error in getTradeAccountData:", error)
    return null
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("Received a message from the content script:", req)

  try {
    const storedData = await storage.get("ws-div-data")

    // const storedData = null

    const cookie = await getCookie()

    if (!cookie) {
      if (storedData) {
        return res.send(storedData)
      }

      res.send({
        error: "No Cookie"
      })
      return
    }

    if (storedData) {
      const { createdAt } = storedData as any

      if (createdAt + 600000 > new Date().getTime()) {
        res.send(storedData)
        return
      }
    }

    const decodedAuthCookie = JSON.parse(decodeURIComponent(cookie.value))
    const accessToken = decodedAuthCookie.access_token
    const idenitityId = decodedAuthCookie.identity_canonical_id

    const allAccFiniancials = await getAllAccountFiniancials(
      accessToken,
      idenitityId
    )

    const cashData = await getCashAccountData(allAccFiniancials, accessToken)

    const tradeData = await getTradeAccountData(allAccFiniancials, accessToken)

    const managedData = await getManagedAccountData(
      allAccFiniancials,
      accessToken
    )

    const dataToStore = {
      cashResp: cashData,
      tradeResp: tradeData,
      managedRes: managedData,
      createdAt: new Date().getTime()
    }

    await storage.set("ws-div-data", dataToStore)

    res.send(dataToStore)
  } catch (error) {
    console.error("Error in getAllAccountDivs:", error)
    res.send({
      error: "Error in getAllAccountDivs"
    })
  }
}

export default handler
