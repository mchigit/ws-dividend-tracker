import { v4 as uuidv4 } from "uuid"

import type { ManagedPosition } from "~types"
import { formatStockWithDiv } from "~utils/shared"

export default function ManagedAccountTable(props: {
  managedPositions: ManagedPosition[]
}) {
  const { managedPositions } = props
  const positionWithDividends = formatStockWithDiv({
    dividends: managedPositions
  })

  const totalDividends = positionWithDividends
    ? positionWithDividends
        .reduce((acc, pos) => acc + pos.totalDividend, 0)
        .toFixed(2)
    : 0


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
                  Symbol
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Div Yield
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Dividend
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Div / Share
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {positionWithDividends.map((position) => {
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
                    <td className="whitespace-nowrap text-start px-3 py-4 text-sm text-gray-500">
                      ${position.totalDividendPerShare.toFixed(2)}
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
