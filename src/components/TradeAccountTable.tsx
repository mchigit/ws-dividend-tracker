import type { Position } from "~types"
import { calculateTotalDividends } from "~utils/trade"

export default function TradeAccountTable(props: {
  tradePositions: Position[]
}) {
  const { tradePositions } = props

  const positionWithDividends = calculateTotalDividends(tradePositions)

  console.log(positionWithDividends)

  const totalDividends = positionWithDividends
    ? positionWithDividends
        .reduce((acc, pos) => acc + pos.totalDividend, 0)
        .toFixed(2)
    : 0

  return (
    <>
      <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-2 bg-white px-4 py-6">
          <dt className="text-lg font-medium leading-6 text-gray-500">
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
          {positionWithDividends.map((position) => (
            <tr key={position.symbol}>
              <td className="whitespace-nowrap text-start py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {position.symbol}
              </td>
              <td className="whitespace-nowrap text-start px-3 py-4 text-sm text-gray-500">
                ${position.totalDividend.toFixed(2)}
              </td>
              <td className="whitespace-nowrap text-start px-3 py-4 text-sm text-gray-500">
                ${position.totalDividendPerShare.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
