import { parse } from "node-html-parser"

import type { Position } from "~types"

import { EXCHANGE_MAP, getYahooAutoComplete, YAHOO_SYMBOL_MAPS } from "./yahoo"

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

const getYahooFinanceData = async (position: Position) => {
  let stockSymbol = position.stock.symbol

  if (stockSymbol in YAHOO_SYMBOL_MAPS) {
    stockSymbol = YAHOO_SYMBOL_MAPS[stockSymbol]
  } else {
    const stockName = position.stock.name

    let autoCompleteRes = await getYahooAutoComplete(stockSymbol)
    if (autoCompleteRes.quotes.length === 0) {
      autoCompleteRes = await getYahooAutoComplete(stockName)
    }

    if (autoCompleteRes.quotes.length === 0) {
      return
    }

    const wsExchange = position.stock.primary_exchange
    let autoCompleteQuote = autoCompleteRes.quotes[0]

    if (wsExchange === "TSX") {
      autoCompleteQuote = autoCompleteRes.quotes.find((quote) => {
        return quote.exchange === EXCHANGE_MAP.TSX
      })
    }

    stockSymbol = autoCompleteQuote.symbol
  }

  // const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?events=div&interval=1d&range=5y`
  // const yahooResp = await fetch(url)

  // if (yahooResp.ok) {
  //   const data = await yahooResp.json()
  //   return data.chart.result[0]
  // }

  const url = `https://ca.finance.yahoo.com/quote/${stockSymbol}`
  const htmlRes = await fetch(url)

  if (!htmlRes.ok) {
    return
  }

  const html = await htmlRes.text()
  const root = parse(html)

  let dividendYield = root.querySelector(
    'td[data-test="TD_YIELD-value"]'
  )?.innerText

  if (!dividendYield) {
    dividendYield = root.querySelector(
      'td[data-test="DIVIDEND_AND_YIELD-value"]'
    )?.innerText

    // Extract value from ()
    dividendYield = dividendYield?.match(/\(([^)]+)\)/)?.[1]
  }

  const regularMarketPrice = root
    .querySelector(
      `fin-streamer[data-field="regularMarketPrice"][data-symbol="${stockSymbol}"]`
    )
    ?.getAttribute("value")

  return {
    stock: stockSymbol,
    dividendYield,
    regularMarketPrice
  }
}

export const getAllDividends = async (positions: Position[]) => {
  const allStockData = await Promise.all(
    positions.map(async (position) => {
      const stockDivYield = await getYahooFinanceData(position)

      if (!stockDivYield || stockDivYield.dividendYield === "N/A") {
        return
      }

      return {
        quantity: position.quantity,
        stockData: stockDivYield
      }
    })
  )

  return allStockData.filter(Boolean)
}
