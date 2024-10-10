/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import CashIcon from "data-base64:~assets/cashIcon.svg"
import openNewTab from "data-base64:~assets/openNewTab.svg"
import ManagedIcon from "data-base64:~assets/managedIcon.png"
import TradeIcon from "data-base64:~assets/tradeIcon.svg"
import { useState } from "react"

import type {
  CashAccount,
  ManagedPosition,
  Position
} from "~types"
import { getYearlyTotal } from "~utils/graphql"
import { formatStockWithDiv } from "~utils/shared"

import CashAccountTable from "./CashAccountTable"
import ManagedAccountTable from "./ManagedAccountTable"
import TradeAccountTable from "./TradeAccountTable"
import { openDetailsTab } from "~details"

const tabs = [
  { name: "Cash", href: "#", icon: CashIcon },
  { name: "Self-Directed", href: "#", icon: TradeIcon },
  { name: "Managed", href: "#", icon: ManagedIcon },
  { name: "Details", href: "#", icon: openNewTab }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function AccountsDashboard(props: {
  cashAccount: CashAccount
  tradePositions: Position[]
  ManagedAccData: ManagedPosition[]
}) {
  const [currentTab, setCurrentTab] = useState<string | null>("Cash")

  const setCurrentTabHandler = (tab: string) => {
    setCurrentTab(tab)
  }

  const positionWithDividends = formatStockWithDiv(props.tradePositions)

  const totalTradeDividends = positionWithDividends
    ? positionWithDividends.reduce((acc, pos) => acc + pos.totalDividend, 0)
    : 0
  const cashYearlyTotal = getYearlyTotal(
    props.cashAccount.balance.cents / 100,
    parseFloat(props.cashAccount.interestRate.interestRate)
  )

  const totalDividends = (totalTradeDividends + cashYearlyTotal).toFixed(2)

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
        <dt className="my-2 text-sm font-medium text-gray-500">
          Yearly Dividend + Interest
        </dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          ${totalDividends}
        </dd>
      </div>
      <div className="border-b border-gray-200 mt-10">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={async () => {
                if (tab.name === "Details") {
                  await openDetailsTab()
                } else {
                  setCurrentTabHandler(tab.name)
                }
         
              }}
              className={classNames(
                currentTab === tab.name
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium bg-none"
              )}
              aria-current={currentTab === tab.name ? "page" : undefined}>
              <img
                src={tab.icon}
                alt=""
                className={classNames(
                  currentTab === tab.name
                    ? "text-indigo-500"
                    : "text-gray-400 group-hover:text-gray-500",
                  "-ml-0.5 mr-2 h-5 w-5"
                )}></img>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-4">
        {currentTab === "Cash" && (
          <CashAccountTable cashAccount={props.cashAccount} />
        )}
        {currentTab === "Self-Directed" && (
          <TradeAccountTable tradePositions={props.tradePositions} />
        )}
        {currentTab === "Managed" && (
          <ManagedAccountTable managedPositions={props.ManagedAccData} />
        )}
      </div>
    </div>
  )
}
