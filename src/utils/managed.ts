import type { ManagedPosition } from "~types"

const getYahooDividendEventsPastYear = async (position: ManagedPosition) => {
  const dividendEvents: Record<
    string,
    {
      amount: number
      date: number
    }
  > = {}

  if (position.currency.toLowerCase() === "cad") {
    const stockSymbol = position.symbol + ".TO"
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?events=div&interval=1d&range=1y`
    const yahooResp = await fetch(url)
    if (yahooResp.ok) {
      const data = await yahooResp.json()
      const divEvents = data?.chart?.result[0].events?.dividends
      if (divEvents) {
        Object.keys(divEvents).forEach((key) => {
          dividendEvents[key] = {
            amount: divEvents[key].amount,
            date: divEvents[key].date
          }
        })
      }
    }
  }

  if (Object.keys(dividendEvents).length === 0) {
    const stockSymbol = position.symbol
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?events=div&interval=1d&range=1y`
    const yahooResp = await fetch(url)
    if (yahooResp.ok) {
      const data = await yahooResp.json()
      const divEvents = data?.chart?.result[0].events?.dividends
      if (divEvents) {
        Object.keys(divEvents).forEach((key) => {
          dividendEvents[key] = {
            amount: divEvents[key].amount,
            date: divEvents[key].date
          }
        })
      }
    }
  }

  return dividendEvents
}

const filterOutCash = (managedPositions: ManagedPosition[]) => {
  return managedPositions.filter((position) => position.type !== "currency")
}

const calculateTotalDividendPerYear = (
  dividendsPerYear: Record<
    string,
    {
      amount: number
      date: number
    }
  >
) => {
  let totalDividend = 0
  Object.keys(dividendsPerYear).forEach((key) => {
    totalDividend += dividendsPerYear[key].amount
  })

  return totalDividend
}

export const calculateManagedPositionDividends = async (
  managedPositions: ManagedPosition[]
) => {
  const filteredPositions = filterOutCash(managedPositions)
  const allStockData = await Promise.all(
    filteredPositions.map(async (position) => {
      const divData = await getYahooDividendEventsPastYear(position)
      //   const divEvents = divData?.events?.dividends
      if (!divData) {
        return null
      }

      const totalDividendPerSharePerYear =
        calculateTotalDividendPerYear(divData)

      return {
        ...position,
        symbol: position.symbol,
        quantity: parseFloat(position.quantity),
        totalDivPerYear:
          totalDividendPerSharePerYear * parseFloat(position.quantity),
        totalDivPerYearPerShare: totalDividendPerSharePerYear
      }
    })
  )

  //   const

  return allStockData.filter((position) => !!position)
}
