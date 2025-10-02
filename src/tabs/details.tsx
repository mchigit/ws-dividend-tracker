import "~style.css"

import { Switch } from "@headlessui/react"
import { Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import Select from "react-select"

import DivBarChart from "~components/DivBarChart"
import DivHistory from "~components/DivHistory"
import Header from "~components/Header"
import NeedLoginBanner from "~components/NeedLoginBanner"
import OldDataBanner from "~components/OldDataBanner"
import { useFetchCashAccountsQuery, useFetchDivDetailsQuery } from "~queries"
import type { FeedItem } from "~types"
import { ACC_TYPES, getAccountName, HISTORY_FILTERS } from "~utils/shared"

const queryClient = new QueryClient()

const getTotalAmount = (items: FeedItem[]) => {
  const total = items.reduce((acc, item) => {
    return acc + parseFloat(item.amount.toString())
  }, 0)

  return total.toFixed(2)
}

function FilterBySymbolDropdown(props: {
  activeFilter: Record<string, string[]>
  setActiveFilter: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
  symbols: string[]
}) {
  const { activeFilter, setActiveFilter, symbols } = props

  const allSymbols = symbols.map((item) => ({
    label: item,
    value: item
  }))

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-lg font-semibold">Filter by Symbol</label>
      <Select
        defaultValue={allSymbols.filter((item) =>
          activeFilter[HISTORY_FILTERS.BY_ASSET]?.includes(item.value)
        )}
        closeMenuOnSelect={false}
        isMulti={true}
        name="Filter By Symbol"
        options={allSymbols as any}
        placeholder="Select Symbol"
        onChange={(selected) => {
          setActiveFilter({
            ...activeFilter,
            [HISTORY_FILTERS.BY_ASSET]: selected.map((item: any) => item.value)
          })
        }}
        isClearable={false}
        styles={{
          container: (baseStyles) => ({
            ...baseStyles,
            width: "100%"
          })
        }}
      />
    </div>
  )
}

function FilterByAccDropdown(props: {
  activeFilter: Record<string, string[]>
  setActiveFilter: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
  uniqueAccs: Array<{
    id: string
    type: string
    unifiedAccountType: string
  }>
}) {
  const { activeFilter, setActiveFilter, uniqueAccs } = props
  const allAccounts = uniqueAccs.map((item) => ({
    label: getAccountName(item.id, item.unifiedAccountType),
    value: item.id
  }))

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-lg font-semibold">Filter by Account</label>
      <Select
        defaultValue={allAccounts.filter((item) =>
          activeFilter[HISTORY_FILTERS.BY_ACCOUNT]?.includes(item.value)
        )}
        closeMenuOnSelect={false}
        isMulti={true}
        name="Filter By Account"
        options={allAccounts as any}
        placeholder="Select Account"
        onChange={(selected) => {
          setActiveFilter({
            ...activeFilter,
            [HISTORY_FILTERS.BY_ACCOUNT]: selected.map(
              (item: any) => item.value
            )
          })
        }}
        isClearable={false}
        styles={{
          container: (baseStyles) => ({
            ...baseStyles,
            width: "100%"
          })
        }}
      />
    </div>
  )
}

function FilterByAccTypeDropdown(props: {
  activeFilter: Record<string, string[]>
  setActiveFilter: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
  dataItems?: FeedItem[]
}) {
  const { activeFilter, setActiveFilter } = props
  const allAccTypes = Object.keys(ACC_TYPES).map((key) => ({
    label: ACC_TYPES[key],
    value: key
  }))

  allAccTypes.unshift({ label: "All", value: "all" })

  return (
    <div className="flex flex-col gap-y-2 w-full">
      <label className="text-lg font-semibold">Filter by Account Type</label>
      <Select
        defaultValue={allAccTypes.filter((item) =>
          activeFilter[HISTORY_FILTERS.BY_ACC_TYPE]?.includes(item.value)
        )}
        closeMenuOnSelect={true}
        name="Filter By Account Type"
        options={allAccTypes as any}
        placeholder="Select Account Type"
        onChange={(selected) => {
          if (selected.value === "all") {
            setActiveFilter({
              ...activeFilter,
              [HISTORY_FILTERS.BY_ACC_TYPE]: []
            })
            return
          }
          setActiveFilter({
            ...activeFilter,
            [HISTORY_FILTERS.BY_ACC_TYPE]: [selected.value]
          })
        }}
        isClearable={false}
        styles={{
          container: (baseStyles) => ({
            ...baseStyles,
            width: "100%"
          })
        }}
      />
    </div>
  )
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

  console.log("Cash Accounts Data:", cashAccountsData)

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
              />
            </div>
          </>
        )}

        <>
          <h1 className="text-3xl font-bold mt-10">History</h1>
          <div className="w-full flex items-center justify-start flex-col">
            <div className="grid grid-cols-3 gap-6 w-full my-8">
              {data?.filterValues && (
                <>
                  <FilterBySymbolDropdown
                    activeFilter={activeFilters}
                    setActiveFilter={setActiveFilters}
                    symbols={data.filterValues.symbols}
                  />
                  <FilterByAccDropdown
                    activeFilter={activeFilters}
                    setActiveFilter={setActiveFilters}
                    uniqueAccs={data.filterValues.uniqueAccs}
                  />
                  <FilterByAccTypeDropdown
                    activeFilter={activeFilters}
                    setActiveFilter={setActiveFilters}
                  />
                </>
              )}
            </div>
            {!isLoading && filteredFeedItems.length === 0 && (
              <div className="overflow-hidden rounded-lg bg-gray-200 !w-[500px]">
                <div className="px-4 py-5 sm:p-6 flex items-center justify-center w-full">
                  <p className="text-md">
                    No data found for the selected filters.
                  </p>
                </div>
              </div>
            )}
            {filteredFeedItems.length > 0 && (
              <DivHistory
                data={filteredFeedItems}
                accountsInfo={data?.filterValues?.uniqueAccs}
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
