import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

import type { ManagedPosition } from "~types"
import { formatStockWithDiv, sortTable } from "~utils/shared"

export default function ManagedAccountTable(props: {
  managedPositions: ManagedPosition[]
}) {
  const { managedPositions } = props
  const [currentSort, setCurrentSort] = useState<string>("symbol")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const positionWithDividends = formatStockWithDiv(managedPositions)

  const totalDividends = positionWithDividends
    ? positionWithDividends
        .reduce((acc, pos) => acc + pos.totalDividend, 0)
        .toFixed(2)
    : 0

  const sortedPositions = sortTable(
    positionWithDividends,
    currentSort,
    sortDirection
  )

  return (
    <div className="flex items-center justify-center flex-col">
      {positionWithDividends && (
        <>
          <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
            <div className="flex flex-col items-center gap-x-2 gap-y-2 bg-white px-4 py-6">
              <dt className="text-lg text-center font-medium leading-6 text-gray-500">
                Total Div / Year
              </dt>
              <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
                $ {totalDividends}
              </dd>
            </div>
          </dl>
          <table className="min-w-full divide-y divide-gray-300 mt-10">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  <button
                    onClick={() => {
                      setCurrentSort("symbol")
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }}
                    className="group inline-flex">
                    Symbol
                    <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => {
                      setCurrentSort("quantity")
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }}
                    className="group inline-flex">
                    Quantity
                    <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => {
                      setCurrentSort("divYield")
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }}
                    className="group inline-flex">
                    Div Yield
                    <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  <button
                    onClick={() => {
                      setCurrentSort("dividend")
                      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }}
                    className="group inline-flex">
                    Dividend
                    <span className="invisible ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                      <ChevronDownIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  </button>
                </th>
                {/* <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Div / Share
            </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedPositions.map((position) => {
                const id = uuidv4()
                return (
                  <tr key={`${position.symbol}-${id}`}>
                    <td className="whitespace-nowrap text-start py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {position.symbol}
                    </td>
                    <td className="whitespace-nowrap text-start px-3 py-4 text-sm text-gray-500">
                      {position.quantity.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap text-start px-3 py-4 text-sm text-gray-500">
                      {position.divYield.toFixed(2)}%
                    </td>
                    <td className="whitespace-nowrap text-start px-3 py-4 text-sm text-gray-500">
                      ${position.totalDividend.toFixed(2)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
