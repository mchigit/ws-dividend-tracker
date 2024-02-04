import "~style.css"

import { Spinner } from "@material-tailwind/react"
import React, { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import AccountsDashboard from "~components/AccountsDashboard"
import { type CashAccount, type Position } from "~types"

function IndexPopup() {
  const [CashAccount, setCashAccount] = useState<CashAccount | null>(null)
  const [TradePositions, setTradePositions] = useState<Position[] | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getResp() {
      const resp = await sendToBackground({
        name: "getCashDiv"
      })

      if (resp?.balance && resp?.interestRate) {
        setCashAccount(resp)
      }

      const tradeResp = await sendToBackground({
        name: "getTradeDividend"
      })

      if (tradeResp) {
        setTradePositions(tradeResp)
      }

      setLoading(false)
    }

    getResp()
  }, [])

  return (
    <div className="bg-white w-[400px] p-4">
      <div className="mx-auto text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          WealthSimple Dividend Tracker
        </h2>
        <div className="p-8 w-full flex flex-col items-center justify-center">
          {loading && <Spinner className="h-12 w-12" />}
          <div className="w-full">
            {!loading && CashAccount && TradePositions && (
              <AccountsDashboard tradePositions={TradePositions} cashAccount={CashAccount} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
