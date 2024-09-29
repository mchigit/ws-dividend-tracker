import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { openDetailsTab } from "../details"

import type { CashAccountInterest, ManagedPosition } from "~types"

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
]

function formatCashInterestsForGraph(
  formattedCashInterests: CashAccountInterest[]
) {
  // Create an object to hold the sum of interests for each month
  const interestsByMonth = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0
  }

  // Filter the interests for the current year (2024) and sum the amounts by month
  const currentYear = new Date().getFullYear()
  formattedCashInterests
    .filter(
      (interest) => new Date(interest.occurredAt).getFullYear() === currentYear
    )
    .forEach((interest) => {
      const monthIndex = new Date(interest.occurredAt).getMonth()
      const monthName = months[monthIndex]
      interestsByMonth[monthName] += parseFloat(interest.amount)
    })

  // Convert the result to the required format
  const formattedData = months.map((month) => ({
    name: month,
    "Cash Interest": interestsByMonth[month]
  }))

  return formattedData
}

function formatPositionDivForGraph(tradePositions: any[]) {
  const dividendsData = tradePositions
    .map((stock) => {
      if (stock?.stockData?.events) {
        return {
          symbol: stock.stockData.meta.symbol,
          events: stock.stockData.events,
          quantity: stock.quantity,
          currency: stock.stockData?.meta?.currency
        }
      }
    })
    .filter(Boolean)

  const dividendsByMonth = {
    Jan: 0,
    Feb: 0,
    Mar: 0,
    Apr: 0,
    May: 0,
    Jun: 0,
    Jul: 0,
    Aug: 0,
    Sep: 0,
    Oct: 0,
    Nov: 0,
    Dec: 0
  }

  const currentYear = new Date().getFullYear()

  // Iterate over the provided dividend data
  dividendsData.forEach((stock) => {
    const { events, quantity } = stock

    // Iterate over dividend events
    Object.values(events.dividends).forEach((dividend: any) => {
      const dividendDate = new Date(dividend.date * 1000)
      const dividendYear = dividendDate.getFullYear()

      // Only consider dividends from the current year
      if (dividendYear === currentYear) {
        const monthIndex = dividendDate.getMonth()
        const monthName = months[monthIndex]

        // Multiply the dividend amount by the quantity and add to the corresponding month
        dividendsByMonth[monthName] += dividend.amount * quantity
      }
    })
  })

  // Convert the dividendsByMonth object into the desired format
  const formattedData = months.map((month) => ({
    name: month,
    interest: parseFloat(dividendsByMonth[month].toFixed(2)) // Format to 2 decimal places
  }))

  return formattedData
}

export default function DividendBreakdown(props: {
  //   cashAccount: CashAccount
  tradePositions: any
  managedPositions: ManagedPosition[]
  cashInterests: CashAccountInterest[]
}) {
  const { tradePositions, managedPositions, cashInterests } = props

  const cashData = formatCashInterestsForGraph(cashInterests)
  const tradeGraphData = formatPositionDivForGraph(tradePositions.dividends)
  const managedGraphData = formatPositionDivForGraph(managedPositions)

  const currentYear2Dig = new Date().getFullYear().toString()

  const allData = months.map((month) => {
    return {
      name: `${month}`,
      "Cash Interest":
        cashData.find((data) => data.name === month)?.["Cash Interest"] || 0,
      "Trade Interest":
        tradeGraphData.find((data) => data.name === month)?.interest || 0,
      "Managed Interest":
        managedGraphData.find((data) => data.name === month)?.interest || 0
    }
  })


  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-2xl my-6">Monthly Breakdown - {currentYear2Dig}</h1>
      <button
        type="button"
        className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        onClick={async () => await openDetailsTab()}
        >
        See Details
      </button>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={allData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(val) => `$${val}`} />
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
          <Bar
            dataKey="Cash Interest"
            fill="#323030"
            stackId="a"
            // activeBar={<Rectangle fill="pink" stroke="blue" />}
          />
          <Bar
            dataKey="Trade Interest"
            fill="#78b2b2"
            stackId="a"
            // activeBar={<Rectangle fill="blue" stroke="blue" />}
          />
          <Bar
            dataKey="Managed Interest"
            fill="#f7c359"
            stackId="a"
            // activeBar={<Rectangle fill="blue" stroke="blue" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
