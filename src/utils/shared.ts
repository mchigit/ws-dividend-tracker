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
