import "~style.css"

import { Switch } from "@headlessui/react"
import { Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"
import Select from "react-select"

import DivBarChart from "~components/DivBarChart"
import DivHistory from "~components/DivHistory"
import Header from "~components/Header"
import NeedLoginBanner from "~components/NeedLoginBanner"
import OldDataBanner from "~components/OldDataBanner"
import { useFetchDivDetailsQuery, useFetchFilterValsQuery } from "~queries"
import type { FeedItem } from "~types"
import { ACC_TYPES, getAccountName, HISTORY_FILTERS } from "~utils/shared"

const queryClient = new QueryClient()

const getTotalAmount = (items: FeedItem[], yearToDate?: boolean) => {
  if (yearToDate) {
    const currentYear = new Date().getFullYear()
    const total = items.reduce((acc, item) => {
      const itemYear = new Date(item.occurredAt).getFullYear()
      return itemYear === currentYear
        ? acc + parseFloat(item.amount.toString())
        : acc
    }, 0)

    return total.toFixed(2)
  }

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
        return item.unifiedAccountType.toLowerCase().includes(
          activeFilters[HISTORY_FILTERS.BY_ACC_TYPE][0].toLowerCase()
        )
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

  const { data, isLoading } = useFetchDivDetailsQuery()
  const { data: filterData, isLoading: filterDataLoading } =
    useFetchFilterValsQuery()

  const filteredFeedItems = filterFeedItems(
    data?.feedItems || [],
    activeFilters
  )

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
              <h1 className="text-3xl font-bold">Year to date</h1>
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
              Total: ${getTotalAmount(data.feedItems, true)}
            </h2>
            <div className="w-full h-[500px] my-8">
              <DivBarChart stackedGraph={graphStacked} data={data.feedItems} />{" "}
            </div>
          </>
        )}

        <>
          <h1 className="text-3xl font-bold mt-10">History</h1>
          <div className="w-full flex items-center justify-start flex-col">
            <div className="grid grid-cols-3 gap-6 w-full my-8">
              {filterData && (
                <>
                  <FilterBySymbolDropdown
                    activeFilter={activeFilters}
                    setActiveFilter={setActiveFilters}
                    symbols={filterData.symbols}
                  />
                  <FilterByAccDropdown
                    activeFilter={activeFilters}
                    setActiveFilter={setActiveFilters}
                    uniqueAccs={filterData.uniqueAccs}
                  />
                  <FilterByAccTypeDropdown
                    activeFilter={activeFilters}
                    setActiveFilter={setActiveFilters}
                  />
                </>
              )}
            </div>
            {!isLoading &&
              !filterDataLoading &&
              filteredFeedItems.length === 0 && (
                <div className="overflow-hidden rounded-lg bg-gray-200 !w-[500px]">
                  <div className="px-4 py-5 sm:p-6 flex items-center justify-center w-full">
                    <p className="text-md">
                      No data found for the selected filters.
                    </p>
                  </div>
                </div>
              )}
            {filteredFeedItems.length > 0 && (
              <DivHistory data={filteredFeedItems} />
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
