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
import TradeIcon from "data-base64:~assets/tradeIcon.svg"
import { useState } from "react"

import type { CashAccount, Position } from "~types"

import CashAccountTable from "./CashAccountTable"
import TradeAccountTable from "./TradeAccountTable"

const tabs = [
  { name: "Cash", href: "#", icon: CashIcon },
  { name: "Trade", href: "#", icon: TradeIcon }
  // { name: "Invest", href: "#", icon: UsersIcon }
]

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export default function AccountsDashboard(props: {
  cashAccount: CashAccount
  tradePositions: Position[]
}) {
  const [currentTab, setCurrentTab] = useState<string | null>("Cash")

  const setCurrentTabHandler = (tab: string) => {
    setCurrentTab(tab)
  }

  return (
    <div className="w-full">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setCurrentTabHandler(tab.name)}
              className={classNames(
                currentTab === tab.name
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                "group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium bg-none"
              )}
              aria-current={currentTab === tab.name ? "page" : undefined}>
              {/* <tab.icon
                className={classNames(
                  currentTab === tab.name
                    ? "text-indigo-500"
                    : "text-gray-400 group-hover:text-gray-500",
                  "-ml-0.5 mr-2 h-5 w-5"
                )}
                aria-hidden="true"
              /> */}
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
        {currentTab === "Trade" && (
          <TradeAccountTable tradePositions={props.tradePositions} />
        )}
      </div>
    </div>
  )
}
