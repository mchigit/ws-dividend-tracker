import type { Position } from "~types"

import { getWSSecurityFundamentals } from "./graphql"

export const getTradePositions = async (accessToken: string) => {
  const response = await fetch(
    "https://trade-service.wealthsimple.com/account/positions",
    {
      headers: {
        authorization: `Bearer ${accessToken}`
      }
    }
  )

  const json = await response.json()

  return json.results
}

export const getAllDividends = async (
  positions: Position[],
  accessToken: string
) => {
  const allStockData = await Promise.all(
    positions.map(async (position) => {
      const stockDivYield = await getWSSecurityFundamentals(
        accessToken,
        position.sec_id
      )

      if (
        stockDivYield?.data?.security?.fundamentals?.yield &&
        stockDivYield?.data?.security?.quote?.last
      ) {
        return {
          quantity: position.quantity,
          stockData: {
            dividendYield: stockDivYield.data.security.fundamentals.yield * 100,
            regularMarketPrice: parseFloat(
              stockDivYield.data.security.quote.last
            ),
            stock: position.stock.symbol
          }
        }
      }

      return null
    })
  )

  return allStockData.filter(Boolean)
}
