import queryString from "query-string"

const YAHOO_BASE = "https://query1.finance.yahoo.com"

export const getYahooAutoComplete = async (query: string) => {
  const queryParam = queryString.stringify({
    q: query,
    enableFuzzyQuery: false,
    quotesQueryId: "tss_match_phrase_query",
    multiQuoteQueryId: "multi_quote_single_token_query",
    newsQueryId: "news_cie_vespa",
    enableCb: true,
    enableNavLinks: true,
    enableEnhancedTrivialQuery: true,
    enableCulturalAssets: true,
    enableLogoUrl: true
  })

  const url = `${YAHOO_BASE}/v1/finance/search?${queryParam}`

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error("Failed to fetch auto complete from Yahoo")
  }

  return res.json()
}
