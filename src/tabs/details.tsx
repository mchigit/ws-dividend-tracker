import "~style.css"

import { Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import DivBarChart from "~components/DivBarChart"
import DivHistory from "~components/DivHistory"
import Header from "~components/Header"
import { useFetchDivDetailsQuery } from "~queries"
import type { FeedItem } from "~types"

const queryClient = new QueryClient()

const getTotalAmount = (items: FeedItem[], yearToDate?: boolean) => {
  if (yearToDate) {
    const currentYear = new Date().getFullYear()
    const total = items.reduce((acc, item) => {
      const itemYear = new Date(item.occurredAt).getFullYear()
      return itemYear === currentYear ? acc + parseFloat(item.amount.toString()) : acc
    }, 0)

    return total.toFixed(2)
  }

  const total = items.reduce((acc, item) => {
    return acc + parseFloat(item.amount.toString())
  }, 0)

  return total.toFixed(2)
}

function WsDividendDetails() {
  const { data, isLoading } = useFetchDivDetailsQuery()

  return (
    <div className="w-full">
      <Header />
      <div className="w-full p-8 mx-auto max-w-7xl">
        {isLoading && (
          <div className="flex items-center justify-center w-full">
            <Spinner className="h-12 w-12" />
          </div>
        )}
        <h1 className="text-3xl font-bold">Year to date</h1>
        {data && (
          <>
            <h2 className="text-lg mt-4">Total: ${getTotalAmount(data, true)}</h2>
            <div className="w-full h-[500px] my-8">
              <DivBarChart data={data} />{" "}
            </div>
          </>
        )}
        <h1 className="text-3xl font-bold mt-10">History</h1>
        {data && (
          <div className="w-full flex items-center flex-col">
            <DivHistory data={data} />
          </div>
        )}
      </div>
    </div>
  )
}

function DeltaFlyerPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WsDividendDetails />
    </QueryClientProvider>
  )
}

export default DeltaFlyerPage
