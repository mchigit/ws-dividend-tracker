import React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts"
import type { NameType } from "recharts/types/component/DefaultTooltipContent"
import type { ValueType } from "tailwindcss/types/config"
import { v4 } from "uuid"

import type { FeedItem } from "~types"
import { MONTH_NAME_MAP, MONTH_NUMBER_MAP } from "~utils/shared"

function transformDataForGraph(
  data,
  projectedCashMonthlyIncome?: number,
  currentYear?: number
) {
  const aggregatedData = {}
  const now = new Date()
  const currentMonth = now.getMonth() + 1 // 1-12
  const currentYearNum = now.getFullYear()
  const isCurrentYear = currentYear === currentYearNum

  data.forEach((item) => {
    const date = new Date(item.occurredAt)
    const month = MONTH_NUMBER_MAP[date.toISOString().slice(5, 7)]

    if (!aggregatedData[month]) {
      aggregatedData[month] = {
        name: month,
        "Cash Interest": 0,
        "Self Directed Dividends": 0,
        "Managed Dividends": 0,
        "Cash Interest (Projected)": 0,
        "Self Directed Dividends (Projected)": 0,
        "Managed Dividends (Projected)": 0
      }
    }

    const amount = parseFloat(item.amount.toString())

    if (item.unifiedAccountType.toLowerCase().includes("cash")) {
      aggregatedData[month]["Cash Interest"] += amount
    } else if (
      item.unifiedAccountType.toLowerCase().includes("self_directed")
    ) {
      aggregatedData[month]["Self Directed Dividends"] += amount
    } else if (item.unifiedAccountType.toLowerCase().includes("managed")) {
      aggregatedData[month]["Managed Dividends"] += amount
    }
  })

  return Object.keys(MONTH_NUMBER_MAP)
    .sort()
    .map((key, index) => {
      const month = MONTH_NUMBER_MAP[key]
      const monthNumber = index + 1
      const monthData = aggregatedData[month] || {
        name: month,
        "Cash Interest": 0,
        "Self Directed Dividends": 0,
        "Managed Dividends": 0,
        "Cash Interest (Projected)": 0,
        "Self Directed Dividends (Projected)": 0,
        "Managed Dividends (Projected)": 0
      }

      // Add projected data for future months in the current year
      const isFutureMonth = isCurrentYear && monthNumber > currentMonth
      if (isFutureMonth && projectedCashMonthlyIncome) {
        monthData["Cash Interest (Projected)"] = parseFloat(
          projectedCashMonthlyIncome.toFixed(2)
        )
      }

      monthData["Cash Interest"] = parseFloat(
        monthData["Cash Interest"]
      ).toFixed(2)
      monthData["Self Directed Dividends"] = parseFloat(
        monthData["Self Directed Dividends"]
      ).toFixed(2)
      monthData["Managed Dividends"] = parseFloat(
        monthData["Managed Dividends"]
      ).toFixed(2)

      return monthData
    })
}

const CustomTooltip = ({
  active,
  payload,
  label
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    // Determine if this is a future month
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const hoveredMonth = MONTH_NAME_MAP[label as string]
    const isFutureMonth = hoveredMonth > currentMonth

    // Filter payload based on whether it's a future month
    const filteredPayload = payload.filter((item) => {
      const isProjected = item.dataKey.toString().includes("(Projected)")
      // For future months, only show projected. For current/past, only show actual
      return isFutureMonth ? isProjected : !isProjected
    })

    const totalDiv = filteredPayload.reduce((acc, item) => {
      return acc + parseFloat(item.value)
    }, 0)

    return (
      <div className="overflow-hidden rounded-lg bg-white shadow w-60 p-4">
        <p className="mb-4 text-lg font-semibold">{`${label}`}</p>
        {filteredPayload.map((item) => {
          const isProjected = item.dataKey.toString().includes("(Projected)")
          const displayValue = isProjected
            ? `${item.dataKey} : $${item.value} (Est.)`
            : `${item.dataKey} : $${item.value}`
          return <p key={`${v4()}`}>{displayValue}</p>
        })}
        {/* <p className="intro">{JSON.stringify(payload)}</p> */}
        <p className="mt-4 font-semibold">Total: ${totalDiv.toFixed(2)}</p>
      </div>
    )
  }

  return null
}

export default function DivBarChart(props: {
  data: FeedItem[]
  byAccType?: boolean
  stackedGraph?: boolean
  projectedCashMonthlyIncome?: number
  currentYear?: number
}) {
  const { data, stackedGraph, projectedCashMonthlyIncome, currentYear } = props
  const allData = transformDataForGraph(
    data,
    projectedCashMonthlyIncome,
    currentYear
  )

  return (
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          dataKey="Cash Interest"
          fill="#323030"
          stackId={stackedGraph ? "a" : undefined}
        />
        <Bar
          dataKey="Self Directed Dividends"
          fill="#78b2b2"
          stackId={stackedGraph ? "a" : undefined}
        />
        <Bar
          dataKey="Managed Dividends"
          fill="#f7c359"
          stackId={stackedGraph ? "a" : undefined}
        />
        <Bar
          dataKey="Cash Interest (Projected)"
          fill="#323030"
          fillOpacity={0.4}
          stackId={stackedGraph ? "a" : undefined}
          legendType="none"
        />
        <Bar
          dataKey="Self Directed Dividends (Projected)"
          fill="#78b2b2"
          fillOpacity={0.4}
          stackId={stackedGraph ? "a" : undefined}
          legendType="none"
        />
        <Bar
          dataKey="Managed Dividends (Projected)"
          fill="#f7c359"
          fillOpacity={0.4}
          stackId={stackedGraph ? "a" : undefined}
          legendType="none"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
