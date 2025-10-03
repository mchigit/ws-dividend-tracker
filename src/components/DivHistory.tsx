import type { CalendarDate } from "@internationalized/date"
import React, { useEffect, useMemo } from "react"
import Select from "react-select"

import type { FeedItem } from "~types"
import {
  ACC_TYPES,
  formatToLocalTime,
  getAccountName,
  HISTORY_FILTERS
} from "~utils/shared"

import DatePickerField from "./DatePickerField"
import { CircularPagination } from "./Pagination"

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
    <div className="flex flex-col gap-y-1 w-full">
      <label className="text-xs font-medium text-gray-600">Symbol</label>
      <Select
        defaultValue={allSymbols.filter((item) =>
          activeFilter[HISTORY_FILTERS.BY_ASSET]?.includes(item.value)
        )}
        closeMenuOnSelect={false}
        isMulti={true}
        name="Filter By Symbol"
        options={allSymbols as any}
        placeholder="All Symbols"
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
          }),
          control: (baseStyles) => ({
            ...baseStyles,
            minHeight: "32px",
            fontSize: "0.875rem"
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
    nickname?: string
  }>
}) {
  const { activeFilter, setActiveFilter, uniqueAccs } = props
  const allAccounts = uniqueAccs.map((item) => ({
    label: item.nickname || getAccountName(item.id, item.unifiedAccountType),
    value: item.id
  }))

  return (
    <div className="flex flex-col gap-y-1 w-full">
      <label className="text-xs font-medium text-gray-600">Account</label>
      <Select
        defaultValue={allAccounts.filter((item) =>
          activeFilter[HISTORY_FILTERS.BY_ACCOUNT]?.includes(item.value)
        )}
        closeMenuOnSelect={false}
        isMulti={true}
        name="Filter By Account"
        options={allAccounts as any}
        placeholder="All Accounts"
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
          }),
          control: (baseStyles) => ({
            ...baseStyles,
            minHeight: "32px",
            fontSize: "0.875rem"
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
}) {
  const { activeFilter, setActiveFilter } = props
  const allAccTypes = Object.keys(ACC_TYPES).map((key) => ({
    label: ACC_TYPES[key],
    value: key
  }))

  allAccTypes.unshift({ label: "All", value: "all" })

  return (
    <div className="flex flex-col gap-y-1 w-full">
      <label className="text-xs font-medium text-gray-600">Account Type</label>
      <Select
        defaultValue={allAccTypes.filter((item) =>
          activeFilter[HISTORY_FILTERS.BY_ACC_TYPE]?.includes(item.value)
        )}
        closeMenuOnSelect={true}
        name="Filter By Account Type"
        options={allAccTypes as any}
        placeholder="All Types"
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
          }),
          control: (baseStyles) => ({
            ...baseStyles,
            minHeight: "32px",
            fontSize: "0.875rem"
          })
        }}
      />
    </div>
  )
}

export default function DivHistory(props: {
  data: FeedItem[]
  accountsInfo?: Array<{
    id: string
    type: string
    unifiedAccountType: string
    nickname?: string
  }>
  filterValues?: {
    symbols: string[]
    uniqueAccs: Array<{
      id: string
      type: string
      unifiedAccountType: string
      nickname?: string
    }>
  }
  activeFilters: Record<string, string[]>
  setActiveFilters: React.Dispatch<
    React.SetStateAction<Record<string, string[]>>
  >
}) {
  const { data, accountsInfo, filterValues, activeFilters, setActiveFilters } =
    props
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [startDate, setStartDate] = React.useState<CalendarDate | null>(null)
  const [endDate, setEndDate] = React.useState<CalendarDate | null>(null)

  const filteredData = useMemo(() => {
    if (!startDate && !endDate) {
      return data
    }

    return data.filter((item) => {
      const itemDate = new Date(item.occurredAt)
      const start = startDate
        ? new Date(startDate.year, startDate.month - 1, startDate.day)
        : null
      const end = endDate
        ? new Date(endDate.year, endDate.month - 1, endDate.day)
        : null

      if (start && end) {
        return itemDate >= start && itemDate <= end
      } else if (start) {
        return itemDate >= start
      } else if (end) {
        return itemDate <= end
      }

      return true
    })
  }, [data, startDate, endDate])

  const slicedData = filteredData.slice((page - 1) * pageSize, page * pageSize)
  const maxPage = Math.ceil(filteredData.length / pageSize)

  useEffect(() => {
    setPage(1)
  }, [data, startDate, endDate, pageSize])

  const getAccountDisplayName = (
    accountId: string,
    unifiedAccountType: string
  ) => {
    const accountInfo = accountsInfo?.find((acc) => acc.id === accountId)
    if (accountInfo?.nickname) {
      return accountInfo.nickname
    }
    return getAccountName(accountId, unifiedAccountType)
  }

  return (
    <>
      <div className="border-y border-gray-200 py-4 my-6 w-full">
        <div className="flex justify-between items-start gap-8">
          {/* Left: Date Range */}
          <div className="bg-white rounded-lg border border-gray-300 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Date Range
            </h3>
            <div className="flex gap-3 items-start">
              <DatePickerField
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
              />
              <DatePickerField
                label="End Date"
                value={endDate}
                onChange={setEndDate}
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate(null)
                    setEndDate(null)
                  }}
                  className="mt-6 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right: Additional Filters */}
          {filterValues && (
            <div className="bg-white rounded-lg border border-gray-300 px-4 py-3 flex-1">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Filters
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <FilterBySymbolDropdown
                  activeFilter={activeFilters}
                  setActiveFilter={setActiveFilters}
                  symbols={filterValues.symbols}
                />
                <FilterByAccDropdown
                  activeFilter={activeFilters}
                  setActiveFilter={setActiveFilters}
                  uniqueAccs={filterValues.uniqueAccs}
                />
                <FilterByAccTypeDropdown
                  activeFilter={activeFilters}
                  setActiveFilter={setActiveFilters}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-300 mb-8">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
              Date
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">
              Asset Symbol
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell">
              Account
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell">
              Type
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {slicedData.map((item) => (
            <tr key={item.canonicalId}>
              <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                {formatToLocalTime(item.occurredAt)}
                <dl className="font-normal lg:hidden">
                  <dt className="sr-only">Asset Symbol</dt>
                  <dd className="mt-1 truncate text-gray-700">
                    {item.assetSymbol}
                  </dd>
                  <dt className="sr-only sm:hidden">Account</dt>
                  <dd className="mt-1 truncate text-gray-500 sm:hidden">
                    {getAccountDisplayName(
                      item.accountId,
                      item.unifiedAccountType
                    )}
                  </dd>
                </dl>
              </td>
              <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                {item.assetSymbol}
              </td>
              <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                {getAccountDisplayName(item.accountId, item.unifiedAccountType)}
              </td>
              <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                {item.type}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                ${item.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between w-full mb-6">
        <CircularPagination
          activePage={page}
          maxPages={maxPage}
          setActivePage={setPage}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="page-size-select" className="text-sm text-gray-600">
            Show:
          </label>
          <select
            value={pageSize}
            name="page-size-select"
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
            className="px-2 py-1 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-gray-600">items</span>
        </div>
      </div>
    </>
  )
}
