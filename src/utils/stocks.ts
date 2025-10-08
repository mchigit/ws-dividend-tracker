import { STOCK_API_URL } from "./constants"

export const getDivFrequencyForSymbols = async (
  symbols: string[]
): Promise<Record<string, string>> => {
  const frequencyMap: Record<string, string> = {}

  if (!symbols || symbols.length === 0) {
    return frequencyMap
  }

  try {
    const response = await fetch(`${STOCK_API_URL}/dividend-stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ symbol: symbols })
    })

    if (!response.ok) {
      throw new Error(
        `Error fetching dividend frequencies: ${response.statusText}`
      )
    }

    const data = await response.json()

    for (const symbol of symbols) {
      frequencyMap[symbol] =
        data?.results?.find((item: any) => item.symbol === symbol)?.frequency ||
        "N/A"
    }
  } catch (error) {
    console.error("Failed to fetch dividend frequencies:", error)
  }

  return frequencyMap
}
