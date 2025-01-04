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

function transformDataForGraph(data) {
  const monthMap = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec"
  }

  const aggregatedData = {}

  data.forEach((item) => {
    const date = new Date(item.occurredAt)
    const month = monthMap[date.toISOString().slice(5, 7)]

    if (!aggregatedData[month]) {
      aggregatedData[month] = {
        name: month,
        "Cash Interest": 0,
        "Self Directed Dividends": 0,
        "Managed Dividends": 0
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

  return Object.keys(monthMap)
    .sort()
    .map((key) => {
      const month = monthMap[key]
      const monthData = aggregatedData[month] || {
        name: month,
        "Cash Interest": 0,
        "Self Directed Dividends": 0,
        "Managed Dividends": 0
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
    const totalDiv = payload.reduce((acc, item) => {
      return acc + parseFloat(item.value)
    }, 0)

    return (
      <div className="overflow-hidden rounded-lg bg-white shadow w-60 p-4">
        <p className="mb-4 text-lg font-semibold">{`${label}`}</p>
        {payload.map((item) => {
          return <p key={`${v4()}`}>{`${item.dataKey} : $${item.value}`}</p>
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
}) {
  const { data, stackedGraph } = props
  const allData = transformDataForGraph(data)

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
          // activeBar={<Rectangle fill="pink" stroke="blue" />}
        />
        <Bar
          dataKey="Self Directed Dividends"
          fill="#78b2b2"
          stackId={stackedGraph ? "a" : undefined}
          // activeBar={<Rectangle fill="blue" stroke="blue" />}
        />
        <Bar
          dataKey="Managed Dividends"
          fill="#f7c359"
          stackId={stackedGraph ? "a" : undefined}
          // activeBar={<Rectangle fill="blue" stroke="blue" />}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
