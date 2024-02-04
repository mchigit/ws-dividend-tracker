import type { CashAccount } from "~types"

function getYearlyTotal(balance: number, interestRate: number) {
  return balance * interestRate
}

export default function CashAccountTable(props: { cashAccount: CashAccount }) {
  const { cashAccount } = props
  const yearlyTotal = getYearlyTotal(
    cashAccount.balance.withdrawalBalance / 100,
    parseFloat(cashAccount.interestRate.interestRate)
  )

  return (
    <dl className="mx-auto grid grid-cols-1 gap-px bg-gray-900/5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-2 bg-white px-4 py-6">
        <dt className="text-lg font-medium leading-6 text-gray-500">Balance</dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          ${cashAccount.balance.withdrawalBalance / 100}
        </dd>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-2 bg-white px-4 py-6">
        <dt className="text-lg font-medium leading-6 text-gray-500">
          Interest Rate
        </dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          {parseFloat(cashAccount.interestRate.interestRate) * 100 + "%"}
        </dd>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-2 bg-white px-4 py-6">
        <dt className="text-lg font-medium leading-6 text-gray-500">
          Yearly Total
        </dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          ${yearlyTotal.toFixed(2)}
        </dd>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-2 bg-white px-4 py-6">
        <dt className="text-lg font-medium leading-6 text-gray-500">
          Monthly Total
        </dt>
        <dd className="w-full flex-none text-3xl font-medium leading-10 tracking-tight text-gray-900">
          ${(yearlyTotal / 12).toFixed(2)}
        </dd>
      </div>
    </dl>
  )
}
