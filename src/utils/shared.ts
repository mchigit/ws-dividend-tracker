export type FormattedStockWithDiv = {
  symbol: string
  divYield: number
  totalDividendPerShare: number
  totalDividend: number
  quantity: number
}

export const formatStockWithDiv = (
  allStockData: any
): FormattedStockWithDiv[] => {
  const allStockDivs = allStockData.dividends

  return allStockDivs
    .map((stockData) => {
      if (stockData?.stockData?.events?.dividends) {
        const dividendEvents = stockData.stockData.events.dividends
        if (!dividendEvents || Object.keys(dividendEvents).length === 0) {
          return null
        }
        const currentPrice = stockData?.stockData?.meta?.regularMarketPrice || 0

        if (currentPrice === 0) {
          return null
        }

        const lastDivAmount =
          dividendEvents[Object.keys(dividendEvents)[0]]?.amount || 0

        if (lastDivAmount === 0) {
          return null
        }

        const divYield = calculateDivYieldForStock(
          currentPrice,
          lastDivAmount,
          Object.keys(dividendEvents).length
        )

        return {
          symbol: stockData.stockData.meta.symbol,
          divYield: divYield * 100,
          quantity: stockData.quantity,
          totalDividendPerShare: divYield * currentPrice,
          totalDividend: divYield * currentPrice * stockData.quantity
        }
      }

      return null
    })
    .filter(Boolean)
}

export const calculateDivYieldForStock = (
  stockPrice: number,
  lastDividend: number,
  multiplier: number
) => {
  const divYield = (lastDividend * multiplier) / stockPrice

  return divYield
}
