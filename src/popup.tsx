import "~style.css"

import { Alert, Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"


import AccountsDashboard from "~components/AccountsDashboard"
import { useFetchRespFromBgQuery } from "~queries"

const queryClient = new QueryClient()

function PopupComponet() {
  const { data, isLoading } = useFetchRespFromBgQuery()

  const { cashResp, tradeResp, managedRes, cashInterests } =
    data || {}

  console.log(cashResp)

  return (
    <div className="mx-auto text-center">
      <h2 className="text-xl font-bold tracking-wide my-2 text-gray-900 sm:text-4xl">
        WealthSimple Dividend Tracker
      </h2>
      <div className="p-8 w-full flex flex-col items-center justify-center">
        {isLoading && <Spinner className="h-12 w-12" />}
        <div className="w-full">
          {data?.isOldData && (
            <Alert className="rounded-none border-l-4 border-[#FBC361] bg-[#FBC361]/10 font-medium text-blue-gray-900 text-sm text-left mb-2">
              Your data is potentially outdated. Please login to WealthSimple to
              refresh.
            </Alert>
          )}
          {tradeResp && cashResp && managedRes && cashInterests ? (
            <AccountsDashboard
              tradePositions={tradeResp}
              cashAccount={cashResp}
              ManagedAccData={managedRes.allPositions}
              cashInterests={cashInterests.formattedCashInterests}
            />
          ) : (
            !isLoading && <Alert className="rounded-none border-l-4 border-[#FBC361] bg-[#FBC361]/10 font-medium text-blue-gray-900">
              Please login to WealthSimple
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IndexPopup() {
  return (
    <div className="bg-white w-[550px] p-4">
      <QueryClientProvider client={queryClient}>
        <PopupComponet />
      </QueryClientProvider>
    </div>
  )
}
