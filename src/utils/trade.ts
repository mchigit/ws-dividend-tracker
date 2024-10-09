import type { Position } from "~types"

import { getYahooAutoComplete } from "./yahoo"

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

export const getYahooFinanceData = async (position: Position) => {
  let stockSymbol = position.stock.symbol
  const stockName = position.stock.name

  let autoCompleteRes = await getYahooAutoComplete(stockSymbol)
  if (autoCompleteRes.quotes.length === 0) {
    autoCompleteRes = await getYahooAutoComplete(stockName)
  }

  if (autoCompleteRes.quotes.length === 0) {
    return
  }

  stockSymbol = autoCompleteRes.quotes[0].symbol
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?events=div&interval=1d&range=1y`
  const yahooResp = await fetch(url)

  if (yahooResp.ok) {
    const data = await yahooResp.json()
    return data.chart.result[0]
  }
}

export const getAllDividends = async (positions: Position[]) => {
  const allStockData = await Promise.all(
    positions.map(async (position) => {
      const stockData = await getYahooFinanceData(position)

      if (!stockData) {
        return
      }

      return {
        quantity: position.quantity,
        stockData
      }
    })
  )

  return allStockData.filter(Boolean)
}
