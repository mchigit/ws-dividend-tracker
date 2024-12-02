import { Alert } from "@material-tailwind/react"
import CashIcon from "data-base64:~assets/cashIcon.svg"
import ManagedIcon from "data-base64:~assets/managedIcon.png"
import openNewTab from "data-base64:~assets/openNewTab.svg"
import TradeIcon from "data-base64:~assets/tradeIcon.svg"
import { useState } from "react"

import { openDetailsTab } from "~details"
import type { CashAccount, ManagedPosition, Position } from "~types"
import { getYearlyTotal } from "~utils/graphql"
import { formatStockWithDiv } from "~utils/shared"

import CashAccountTable from "./CashAccountTable"
import ManagedAccountTable from "./ManagedAccountTable"
import TradeAccountTable from "./TradeAccountTable"

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
  cashAccount: CashAccount | null
  tradePositions: Position[] | null
  ManagedAccData: ManagedPosition[] | null
}) {
  const [currentTab, setCurrentTab] = useState<string | null>("Cash")
  const { cashAccount, tradePositions, ManagedAccData } = props

  const setCurrentTabHandler = (tab: string) => {
    setCurrentTab(tab)
  }

  const positionWithDividends = tradePositions
    ? formatStockWithDiv(tradePositions)
    : null
  const managedPosWithDiv = ManagedAccData
    ? formatStockWithDiv(ManagedAccData)
    : null

  const totalTradeDividends = positionWithDividends
    ? positionWithDividends.reduce((acc, pos) => acc + pos.totalDividend, 0)
    : 0

  const totalManagedDividends = managedPosWithDiv
    ? managedPosWithDiv.reduce((acc, pos) => acc + pos.totalDividend, 0)
    : 0

  const cashYearlyTotal = cashAccount
    ? getYearlyTotal(
        cashAccount.balance.cents / 100,
        parseFloat(cashAccount.interestRate.interestRate)
      )
    : 0

  const totalDividends = (
    totalTradeDividends +
    cashYearlyTotal +
    totalManagedDividends
  ).toFixed(2)

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
        {currentTab === "Cash" &&
          (cashAccount ? (
            <CashAccountTable cashAccount={cashAccount} />
          ) : (
            <Alert>No cash account data available</Alert>
          ))}
        {currentTab === "Self-Directed" &&
          (tradePositions ? (
            <TradeAccountTable tradePositions={tradePositions} />
          ) : (
            <Alert>No trade account data available</Alert>
          ))}
        {currentTab === "Managed" &&
          (ManagedAccData ? (
            <ManagedAccountTable managedPositions={ManagedAccData} />
          ) : (
            <Alert>No managed account data available</Alert>
          ))}
      </div>
    </div>
  )
}
