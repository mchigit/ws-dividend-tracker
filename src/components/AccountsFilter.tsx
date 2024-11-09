import { Check } from "lucide-react"
import React, { useState } from "react"

import { formatUnifiedAccountType } from "~utils/shared"

const AccountFilter = ({ data, onFilterChange }) => {
  const uniqueAccounts = Array.from(
    new Set(data.map((item) => item.account_id))
  ).map((accountId: string) => {
    const accountInfo = data.find(
      (item) => item.account_id === accountId
    )?.accountInfo
    return {
      id: accountId,
      type: accountInfo?.type?.toUpperCase() || "",
      nickname: accountInfo?.nickname || accountId,
      unifiedAccountType: accountInfo?.unifiedAccountType,
      currency: accountInfo?.currency
    }
  })

  const [selectedAccounts, setSelectedAccounts] = useState([])

  const handleAccountToggle = (accountId) => {
    const newSelection = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter((id) => id !== accountId)
      : [...selectedAccounts, accountId]

    setSelectedAccounts(newSelection)
    onFilterChange(newSelection)
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            Filter by Account
          </label>
          {selectedAccounts.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {selectedAccounts.length} account
                {selectedAccounts.length !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => {
                  setSelectedAccounts([])
                  onFilterChange([])
                }}
                className="text-sm text-blue-500 hover:text-blue-600">
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {uniqueAccounts.map((account) => (
            <label
              key={account.id}
              className={`
                relative flex items-center p-3 rounded-lg border cursor-pointer
                hover:bg-gray-50 transition-colors
                ${
                  selectedAccounts.includes(account.id)
                    ? "border-blue-500 bg-blue-50 hover:bg-blue-50"
                    : "border-gray-200"
                }
              `}>
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedAccounts.includes(account.id)}
                onChange={() => handleAccountToggle(account.id)}
              />
              <div
                className={`
                  w-5 h-5 border rounded flex items-center justify-center mr-3
                  ${
                    selectedAccounts.includes(account.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  }
                `}>
                {selectedAccounts.includes(account.id) && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {/* <p className="text-sm font-medium text-gray-900 truncate">
                  {account.nickname}
                </p>
                <p className="text-xs text-gray-500 truncate">{account.type}</p> */}
                <p className="text-xs font-medium text-gray-900 truncate">
                  {formatUnifiedAccountType(account.unifiedAccountType)} -{" "}
                  {account.currency}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AccountFilter
