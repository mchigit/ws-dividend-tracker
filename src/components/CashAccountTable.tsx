import type { CashAccount } from "~types"
import { getYearlyTotal } from "~utils/graphql"

export default function CashAccountTable(props: {
  cashAccounts: CashAccount[]
}) {
  const { cashAccounts } = props

  const totalBalance = cashAccounts.reduce(
    (acc, account) => acc + account.balance.cents / 100,
    0
  )

  const totalYearlyInterest = cashAccounts.reduce((acc, account) => {
    return (
      acc +
      getYearlyTotal(
        account.balance.cents / 100,
        parseFloat(account.interestRate.interestRate)
      )
    )
  }, 0)

  return (
    <>
      <dl className="mx-auto grid grid-cols-3 gap-px bg-gray-900/5 mb-8">
        <div className="flex flex-col items-center gap-x-2 gap-y-2 bg-white px-4 py-6">
          <dt className="text-sm font-medium leading-6 text-gray-500">
            Total Balance
          </dt>
          <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
            ${totalBalance.toFixed(2)}
          </dd>
        </div>
        <div className="flex flex-col items-center gap-x-2 gap-y-2 bg-white px-4 py-6">
          <dt className="text-sm font-medium leading-6 text-gray-500">
            Total Yearly Interest
          </dt>
          <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
            ${totalYearlyInterest.toFixed(2)}
          </dd>
        </div>
        <div className="flex flex-col items-center gap-x-2 gap-y-2 bg-white px-4 py-6">
          <dt className="text-sm font-medium leading-6 text-gray-500">
            Monthly Interest
          </dt>
          <dd className="w-full flex-none text-xl font-medium leading-10 tracking-tight text-gray-900 text-center">
            ${(totalYearlyInterest / 12).toFixed(2)}
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-sm font-semibold text-gray-900">
                Account Type
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Balance
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Interest Rate
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Yearly Interest
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-sm font-semibold text-gray-900">
                Monthly Interest
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {cashAccounts.map((account, index) => {
              const yearlyInterest = getYearlyTotal(
                account.balance.cents / 100,
                parseFloat(account.interestRate.interestRate)
              )
              return (
                <tr key={index}>
                  <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    Cash{" "}
                    {account?.accInfo?.accountOwnerConfiguration ===
                    "MULTI_OWNER"
                      ? "(Joint)"
                      : ""}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    ${(account.balance.cents / 100).toFixed(2)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {(
                      parseFloat(account.interestRate.interestRate) * 100
                    ).toFixed(2)}
                    %
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    ${yearlyInterest.toFixed(2)}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    ${(yearlyInterest / 12).toFixed(2)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
