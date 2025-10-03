import "~style.css"

import { Switch } from "@headlessui/react"
import { Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"

import DivBarChart from "~components/DivBarChart"
import DivHistory from "~components/DivHistory"
import Header from "~components/Header"
import NeedLoginBanner from "~components/NeedLoginBanner"
import OldDataBanner from "~components/OldDataBanner"
import { useFetchCashAccountsQuery, useFetchDivDetailsQuery } from "~queries"
import type { FeedItem } from "~types"
import { HISTORY_FILTERS } from "~utils/shared"

const queryClient = new QueryClient()

const getTotalAmount = (items: FeedItem[]) => {
  const total = items.reduce((acc, item) => {
    return acc + parseFloat(item.amount.toString())
  }, 0)

  return total.toFixed(2)
}

function filterFeedItems(
  data: FeedItem[],
  activeFilters: Record<string, string[]>
): FeedItem[] {
  let filteredFeedItems = data

  if (activeFilters) {
    if (activeFilters[HISTORY_FILTERS.BY_ACCOUNT]?.length > 0) {
      filteredFeedItems = filteredFeedItems.filter((item) =>
        activeFilters[HISTORY_FILTERS.BY_ACCOUNT].includes(item.accountId)
      )
    }

    if (activeFilters[HISTORY_FILTERS.BY_ASSET]?.length > 0) {
      filteredFeedItems = filteredFeedItems.filter((item) =>
        activeFilters[HISTORY_FILTERS.BY_ASSET].includes(item.assetSymbol)
      )
    }

    if (activeFilters[HISTORY_FILTERS.BY_ACC_TYPE]?.length > 0) {
      filteredFeedItems = filteredFeedItems.filter((item) => {
        return item.unifiedAccountType
          .toLowerCase()
          .includes(activeFilters[HISTORY_FILTERS.BY_ACC_TYPE][0].toLowerCase())
      })
    }
  }

  return filteredFeedItems
}

function WsDividendDetails() {
  const [graphStacked, setGraphStacked] = useState<boolean>(true)
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(
    {}
  )
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )

  const { data, isLoading } = useFetchDivDetailsQuery()
  const { data: cashAccountsData } = useFetchCashAccountsQuery()

  const projectedCashMonthlyIncome = useMemo(() => {
    if (!cashAccountsData?.cashAccounts) return 0
    return cashAccountsData.cashAccounts.reduce((total, account) => {
      const balance = account.balance.cents / 100
      const currency = account.balance.currency
      const interestRate =
        currency === "USD"
          ? account.interestRate.appliedRates.usdInterestRate
          : account.interestRate.appliedRates.cadInterestRate
      return total + (balance * interestRate) / 12
    }, 0)
  }, [cashAccountsData])

  const filteredFeedItems = filterFeedItems(
    data?.feedItems || [],
    activeFilters
  )

  // Get unique years from feed items
  const availableYears = useMemo(() => {
    if (!data?.feedItems?.length) return []
    return Array.from(
      new Set(
        data.feedItems.map((item) => new Date(item.occurredAt).getFullYear())
      )
    ).sort((a, b) => b - a) // Sort descending
  }, [data?.feedItems])

  const yearFilteredItems = useMemo(() => {
    return filteredFeedItems.filter(
      (item) => new Date(item.occurredAt).getFullYear() === selectedYear
    )
  }, [filteredFeedItems, selectedYear])

  const handleYearChange = (direction: "prev" | "next") => {
    const currentIndex = availableYears.indexOf(selectedYear)
    if (direction === "prev" && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1])
    } else if (direction === "next" && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1])
    }
  }

  return (
    <div className="w-full">
      <Header />
      {data && data.needLogin && (
        <div className="w-full flex items-center justify-center mt-32">
          <NeedLoginBanner />
        </div>
      )}
      {data && data.isOldData === true && <OldDataBanner />}
      <div className="w-full p-8 mx-auto max-w-7xl">
        {isLoading && (
          <div className="flex items-center justify-center w-full">
            <Spinner className="h-12 w-12" />
          </div>
        )}

        {data && data?.feedItems?.length > 0 && (
          <>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-x-4">
                <button
                  onClick={() => handleYearChange("prev")}
                  disabled={
                    availableYears.indexOf(selectedYear) ===
                    availableYears.length - 1
                  }
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous Year
                </button>
                <h1 className="text-3xl font-bold">{selectedYear}</h1>
                <button
                  onClick={() => handleYearChange("next")}
                  disabled={availableYears.indexOf(selectedYear) === 0}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Year
                </button>
              </div>
              <div className="flex items-center gap-x-3">
                <p className="text-lg font-semibold text-gray-800">Separate</p>
                <Switch
                  checked={graphStacked}
                  onChange={setGraphStacked}
                  className="group inline-flex h-6 w-11 items-center rounded-full bg-gray-200 data-[checked]:bg-[#78B2B2] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                  />
                </Switch>
                <p className="text-lg font-semibold text-gray-800">Stacked</p>
              </div>
            </div>

            <h2 className="text-lg mt-4">
              Total: ${getTotalAmount(yearFilteredItems)}
            </h2>
            <div className="w-full h-[500px] my-8">
              <DivBarChart
                stackedGraph={graphStacked}
                data={yearFilteredItems}
                projectedCashMonthlyIncome={projectedCashMonthlyIncome}
                currentYear={selectedYear}
              />
            </div>
          </>
        )}

        <>
          <h1 className="text-3xl font-bold mt-10">History</h1>
          <div className="w-full flex items-center justify-start flex-col">
            {!isLoading && filteredFeedItems.length === 0 && data?.filterValues && (
              <>
                <DivHistory
                  data={[]}
                  accountsInfo={data?.filterValues?.uniqueAccs}
                  filterValues={data.filterValues}
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                />
                <div className="overflow-hidden rounded-lg bg-gray-200 !w-[500px]">
                  <div className="px-4 py-5 sm:p-6 flex items-center justify-center w-full">
                    <p className="text-md">
                      No data found for the selected filters.
                    </p>
                  </div>
                </div>
              </>
            )}
            {filteredFeedItems.length > 0 && data?.filterValues && (
              <DivHistory
                data={filteredFeedItems}
                accountsInfo={data?.filterValues?.uniqueAccs}
                filterValues={data.filterValues}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
              />
            )}
          </div>
        </>
      </div>
    </div>
  )
}

function DetailsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WsDividendDetails />
    </QueryClientProvider>
  )
}

export default DetailsPage
