import type { Position } from "~types"

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
  if (position.currency.toLowerCase() === "cad") {
    stockSymbol += ".TO"
  }

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

      return {
        quantity: position.quantity,
        stockData
      }
    })
  )

  return allStockData
}

export const calculateTotalDividends = (allStockData: any) => {
  const totalDividendPerYear = allStockData.dividends
    .map((stockData) => {
      if (stockData?.stockData?.events?.dividends) {
        const dividendEvents = stockData.stockData.events.dividends

        let totalDividend = 0
        Object.keys(dividendEvents).forEach((key) => {
          totalDividend += dividendEvents[key].amount
        })

        return {
          symbol: stockData.stockData.meta.symbol,
          totalDividendPerShare: parseFloat(totalDividend.toFixed(2)),
          totalDividend:
            parseFloat(totalDividend.toFixed(2)) * stockData.quantity
        }
      }

      return null
    })
    .filter(Boolean)

  return totalDividendPerYear
}
