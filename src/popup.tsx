import "~style.css"

import { Alert, Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import AccountsDashboard from "~components/AccountsDashboard"
import { type CashAccount, type CashAccountInterest, type Position } from "~types"

const DAYS_IN_MS = 24 * 60 * 60 * 1000
const queryClient = new QueryClient()

function IndexPopup() {
  const [CashAccount, setCashAccount] = useState<CashAccount | null>(null)
  const [TradePositions, setTradePositions] = useState<Position[] | null>(null)
  const [ManagedAccData, setManagedAccData] = useState<any | null>(null)
  const [cashInterests, setCashInterests] = useState<CashAccountInterest[] | null>(null)

  const [isOldData, setIsOldData] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getResp() {
      const resp = await sendToBackground({
        name: "getCashDiv"
      })

      if (resp?.balance && resp?.interestRate) {
        setCashAccount(resp)
        if (resp?.createdAt) {
          const createdAt = new Date(resp.createdAt)
          const now = new Date()
          const diff = now.getTime() - createdAt.getTime()
          if (diff > DAYS_IN_MS) {
            setIsOldData(true)
          }
        }
      }

      const tradeResp = await sendToBackground({
        name: "getTradeDividend"
      })

      if (tradeResp) {
        setTradePositions(tradeResp)
      }

      const managedRes = await sendToBackground({
        name: "getManagedAcc"
      })

      if (managedRes && managedRes?.allPositions) {
        setManagedAccData(managedRes.allPositions)
      }

      const cashInterests = await sendToBackground({
        name: "getCashInterests"
      })

      if (cashInterests) {
        setCashInterests(cashInterests.formattedCashInterests)
      }

      setLoading(false)
    }

    getResp()
  }, [])

  return (
    <div className="bg-white w-[550px] p-4">
      <QueryClientProvider client={queryClient}>
        <div className="mx-auto text-center">
          <h2 className="text-xl font-bold tracking-wide my-2 text-gray-900 sm:text-4xl">
            WealthSimple Dividend Tracker
          </h2>
          <div className="p-8 w-full flex flex-col items-center justify-center">
            {loading && <Spinner className="h-12 w-12" />}
            <div className="w-full">
              {isOldData && (
                <Alert className="rounded-none border-l-4 border-[#FBC361] bg-[#FBC361]/10 font-medium text-blue-gray-900 text-sm text-left mb-2">
                  Your data is potentially outdated. Please login to
                  WealthSimple to refresh.
                </Alert>
              )}
              {!loading && CashAccount && TradePositions ? (
                <AccountsDashboard
                  tradePositions={TradePositions}
                  cashAccount={CashAccount}
                  ManagedAccData={ManagedAccData}
                  cashInterests={cashInterests}
                />
              ) : (
                !loading && (
                  <Alert className="rounded-none border-l-4 border-[#FBC361] bg-[#FBC361]/10 font-medium text-blue-gray-900">
                    Please login to WealthSimple
                  </Alert>
                )
              )}
            </div>
          </div>
        </div>
      </QueryClientProvider>
    </div>
  )
}

export default IndexPopup
