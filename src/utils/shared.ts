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

export function generateTimestampNow(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const day = String(now.getUTCDate()).padStart(2, "0")
  const hours = String(now.getUTCHours()).padStart(2, "0")
  const minutes = String(now.getUTCMinutes()).padStart(2, "0")
  const seconds = String(now.getUTCSeconds()).padStart(2, "0")
  const milliseconds = String(now.getUTCMilliseconds()).padStart(3, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`
}

export const isInCurrentYear = (timestamp: string): boolean => {
  const date = new Date(timestamp)
  const currentYear = new Date().getFullYear()

  return date.getFullYear() === currentYear
}

export function formatToLocalTime(timestamp: string) {
  const date = new Date(timestamp)

  // Format the date to local time using Intl.DateTimeFormat with the desired options
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date)

  return formattedDate
}
