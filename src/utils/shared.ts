export type FormattedStockWithDiv = {
  symbol: string
  divYield: number
  totalDividendPerShare: number
  totalDividend: number
  quantity: number
}

// export const getDivFrequency = (
//   dividendEvents: Record<
//     string,
//     {
//       amount: number
//       date: number
//     }
//   >
// ): number => {
//   const lastYear: number = new Date().getFullYear() - 1
//   const dividendsLastYear = []

//   Object.keys(dividendEvents).forEach((div) => {
//     const event = dividendEvents[div]
//     const eventDate = new Date(event.date * 1000)

//     if (eventDate.getFullYear() === lastYear) {
//       dividendsLastYear.push(event)
//     }
//   })

//   if (dividendsLastYear.length === 2 || dividendsLastYear.length === 4) {
//     return dividendsLastYear.length
//   }

//   if (dividendsLastYear.length > 4) {
//     return 12
//   }

//   return dividendsLastYear.length
// }

export const formatStockWithDiv = (
  allStockData: any
): FormattedStockWithDiv[] => {
  const allStockDivs = allStockData.dividends

  return allStockDivs
    .map((div) => {
      // if (stockData?.stockData?.events?.dividends) {
      //   const dividendEvents = stockData.stockData.events.dividends
      //   if (!dividendEvents || Object.keys(dividendEvents).length === 0) {
      //     return null
      //   }
      //   const currentPrice = stockData?.stockData?.meta?.regularMarketPrice || 0

      //   if (currentPrice === 0) {
      //     return null
      //   }

      //   const latestDivTimestamp = Math.max(
      //     ...Object.keys(dividendEvents).map((x) => parseInt(x))
      //   )

      //   const lastDivAmount =
      //     dividendEvents[latestDivTimestamp.toString()]?.amount || 0

      //   if (lastDivAmount === 0) {
      //     return null
      //   }

      //   const divFreq = getDivFrequency(dividendEvents)

      //   const divYield = calculateDivYieldForStock(
      //     currentPrice,
      //     lastDivAmount,
      //     getDivFrequency(dividendEvents)
      //   )

      //   return {
      //     symbol: stockData.stockData.meta.symbol,
      //     divYield: divYield * 100,
      //     quantity: stockData.quantity,
      //     totalDividendPerShare: divYield * currentPrice,
      //     totalDividend: divYield * currentPrice * stockData.quantity
      //   }
      // }

      // return null

      const stockData = div.stockData
      if (
        !stockData ||
        !stockData.dividendYield ||
        !stockData.stock ||
        !stockData.regularMarketPrice
      ) {
        return null
      }

      const currentPrice = stockData.regularMarketPrice
      const divYield = parseFloat(stockData.dividendYield.replace("%", ""))
      const quantity = div.quantity
      const totalDividend = (divYield / 100) * currentPrice * quantity
      const totalDividendPerShare = (divYield / 100) * currentPrice

      return {
        symbol: stockData.stock,
        divYield,
        quantity,
        totalDividendPerShare,
        totalDividend
      }
    })
    .filter(Boolean)
}

// export const calculateDivYieldForStock = (
//   stockPrice: number,
//   lastDividend: number,
//   multiplier: number
// ) => {
//   const divYield = (lastDividend * multiplier) / stockPrice

//   return divYield
// }

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
export function getAccountName(accountId: string, unifiedAccountType: string) {
  if (accountId.includes("tfsa")) {
    if (unifiedAccountType.toLowerCase().includes("managed")) {
      return "TFSA (Managed)"
    }

    return "TFSA (Self Directed)"
  } else if (accountId.includes("rrsp")) {
    if (unifiedAccountType.toLowerCase().includes("managed")) {
      return "RRSP (Managed)"
    }

    return "RRSP (Self Directed)"
  } else if (accountId.includes("cash")) {
    return "Cash"
  } else {
    return "Self Directed"
  }
}

export const HISTORY_FILTERS = {
  BY_ACCOUNT: "BY_ACCOUNT",
  BY_ASSET: "BY_ASSET",
  BY_TYPE: "BY_TYPE",
  BY_ACC_TYPE: "BY_ACC_TYPE"
}

export const ACC_TYPES = {
  CASH: "Cash",
  SELF_DIRECTED: "Self Directed",
  MANAGED: "Managed"
}
