import React, { useEffect } from "react"

import type { FeedItem } from "~types"
import { formatToLocalTime, getAccountName } from "~utils/shared"

import { CircularPagination } from "./Pagination"
// import DivHistoryTable from "./DivHistoryTable"

const PAGE_SIZE = 10

export default function DivHistory(props: { data: FeedItem[] }) {
  const { data } = props
  const [page, setPage] = React.useState(1)
//   const [curSort, setCurSort] = React.useState<string>("date")

  const slicedData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const maxPage = Math.ceil(data.length / PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [data])

  return (
    <>
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
                    {getAccountName(item.accountId, item.unifiedAccountType)}
                  </dd>
                </dl>
              </td>
              <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                {item.assetSymbol}
              </td>
              <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                {getAccountName(item.accountId, item.unifiedAccountType)}
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
      {/* <DivHistoryTable feedItems={slicedData} currentSort={curSort} setSortBy={setCurSort} /> */}
      <CircularPagination
        activePage={page}
        maxPages={maxPage}
        setActivePage={setPage}
      />
    </>
  )
}
