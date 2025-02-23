export type FormattedStockWithDiv = {
  symbol: string
  divYield: number
  totalDividendPerShare: number
  totalDividend: number
  quantity: number
  account_id: string
  price: number
}

export const formatStockWithDiv = (
  allStockData: any
): FormattedStockWithDiv[] => {
  return allStockData
    .map((div) => {
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
      const divYield = stockData.dividendYield
      const quantity = div.quantity
      const totalDividend = (divYield / 100) * currentPrice * quantity
      const totalDividendPerShare = (divYield / 100) * currentPrice

      return {
        ...div,
        price: currentPrice,
        symbol: stockData.stock,
        divYield,
        quantity,
        totalDividendPerShare,
        totalDividend
      }
    })
    .filter(Boolean)
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

export function sortTable(
  positions: FormattedStockWithDiv[],
  sortBy: string,
  direction: "asc" | "desc"
) {
  switch (sortBy) {
    case "symbol":
      return positions.sort((a, b) => {
        if (direction === "asc") {
          return a.symbol.localeCompare(b.symbol)
        }
        return b.symbol.localeCompare(a.symbol)
      })
    case "quantity":
      return positions.sort((a, b) => {
        if (direction === "asc") {
          return a.quantity - b.quantity
        }
        return b.quantity - a.quantity
      })
    case "divYield":
      return positions.sort((a, b) => {
        if (direction === "asc") {
          return a.divYield - b.divYield
        }
        return b.divYield - a.divYield
      })
    case "dividend":
      return positions.sort((a, b) => {
        if (direction === "asc") {
          return a.totalDividend - b.totalDividend
        }
        return b.totalDividend - a.totalDividend
      })
    case "divPerShare":
      return positions.sort((a, b) => {
        if (direction === "asc") {
          return a.totalDividendPerShare - b.totalDividendPerShare
        }
        return b.totalDividendPerShare - a.totalDividendPerShare
      })
    case "price":
      return positions.sort((a, b) => {
        if (direction === "asc") {
          return a.price - b.price
        }
        return b.price - a.price
      })
    default:
      return positions
  }
}

export function formatUnifiedAccountType(unifiedAccountType: string) {
  return unifiedAccountType.replace(/_/g, " ").toUpperCase()
}

export function filterPositionsByAccount(
  positions: FormattedStockWithDiv[],
  accountIds: string[]
) {
  if (accountIds.length === 0) {
    return positions
  }

  return positions.filter((pos) => accountIds.includes(pos.account_id))
}

export const combinePositions = (positions: FormattedStockWithDiv[]) => {
  return positions.reduce((acc, curr) => {
    const existingItem = acc.find((item) => item.symbol === curr.symbol)
    if (existingItem) {
      existingItem.quantity += curr.quantity
      existingItem.totalDividend += curr.totalDividend
      existingItem.totalDividendPerShare += curr.totalDividendPerShare
    } else {
      acc.push(curr)
    }
    return acc
  }, [])
}
