import "~style.css"

import { today, type CalendarDate } from "@internationalized/date"
import { Button, Dialog, Spinner } from "@material-tailwind/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Check } from "lucide-react"
import React, { useState } from "react"
import Select from "react-select"

import DatePickerField from "~components/DatePickerField"
import Header from "~components/Header"
import { useExportActivitiesMutation, useFetchAllAccountsQuery } from "~queries"
import {
  ACTIVITY_TIMEFRAME_PRESETS,
  ACTIVITY_TYPE_OPTIONS
} from "~utils/constants"

const queryClient = new QueryClient()

// Helper function to get account type label
function getAccountTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    tfsa: "TFSA",
    rrsp: "RRSP",
    non_registered: "Non-registered",
    ca_credit_card: "Credit card",
    chequing: "Chequing",
    corporate: "Corporate investing",
    personal: "Personal",
    cash: "Cash",
    margin: "Non-registered margin"
  }

  return typeMap[type] || type.replace(/_/g, " ")
}

// Helper function to get account display name
function getAccountDisplayName(account: {
  nickname: string
  type: string
  unifiedAccountType: string
}): string {
  if (account.nickname) {
    return account.nickname
  }

  const unifiedType = account.unifiedAccountType || ""

  // Handle CREDIT_CARD
  if (unifiedType.includes("CREDIT_CARD")) {
    return "Wealthsimple credit card"
  }

  // Handle CASH accounts
  if (unifiedType === "CASH") {
    return "Personal Chequing"
  }

  // Handle DIRECT_INDEX
  if (unifiedType.includes("DIRECT_INDEX")) {
    return "Direct Indexing"
  }

  // Handle CRYPTO
  if (unifiedType.includes("CRYPTO")) {
    return "Crypto"
  }

  // Extract base type from MANAGED_ or SELF_DIRECTED_ prefix
  let baseType = unifiedType
  if (unifiedType.includes("MANAGED_")) {
    baseType = unifiedType.replace("MANAGED_", "")
  } else if (unifiedType.includes("SELF_DIRECTED_")) {
    baseType = unifiedType.replace("SELF_DIRECTED_", "")
  }

  // Handle CORPORATE_SAVE special case
  if (baseType.includes("CORPORATE_SAVE")) {
    return "Corporate Save"
  }

  // Handle HISA
  if (baseType.includes("HISA")) {
    return "High Interest Savings"
  }

  // Build display name with modifiers
  let displayName = ""

  // Check for JOINT modifier (prepend)
  if (baseType.includes("JOINT")) {
    displayName = "Joint "
    baseType = baseType.replace("JOINT_", "")
  }

  // Map base account types
  if (baseType.includes("TFSA")) {
    displayName += "TFSA"
  } else if (baseType.includes("RRSP")) {
    displayName += "RRSP"
  } else if (baseType.includes("NON_REGISTERED")) {
    displayName += "Non-registered"
  } else if (baseType.includes("CORPORATE")) {
    displayName += "Corporate investing"
  } else {
    // Fallback: format the remaining base type
    displayName += baseType.replace(/_/g, " ")
  }

  // Check for MARGIN modifier (append)
  if (baseType.includes("MARGIN")) {
    displayName += " margin"
  }

  // If we still have no meaningful name, fallback to type label
  if (!displayName.trim() || displayName === baseType) {
    return getAccountTypeLabel(account.type)
  }

  return displayName
}

// Helper function to check if account is managed
function isManaged(unifiedAccountType: string): boolean {
  return unifiedAccountType?.includes("MANAGED")
}

type PreviewData = {
  date: string
  accountName: string
  activityType: string
  description: string
  amount: string
  security: string
  quantity: string
  status: string
  notes: string
}

function WsExportPage() {
  const [openModal, setOpenModal] = useState(false)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<
    { label: string; value: string }[]
  >([{ label: "All Types", value: "all" }])
  const [timeframeOption, setTimeframeOption] = useState<{
    label: string
    value: string
  }>(ACTIVITY_TIMEFRAME_PRESETS[0])
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: CalendarDate | null
    endDate: CalendarDate | null
  }>({
    startDate: null,
    endDate: null
  })
  const [previewData, setPreviewData] = useState<PreviewData[] | null>(null)

  const { data: accountsData, isLoading: accountsLoading } =
    useFetchAllAccountsQuery()

  const exportMutation = useExportActivitiesMutation()

  // Sort accounts by display name in ascending order
  const sortedAccounts = accountsData?.accounts
    ? [...accountsData.accounts].sort((a, b) => {
        const nameA = getAccountDisplayName(a).toLowerCase()
        const nameB = getAccountDisplayName(b).toLowerCase()
        return nameA.localeCompare(nameB)
      })
    : []

  const handleOpenModal = () => {
    setOpenModal(!openModal)
  }

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleClearAll = () => {
    setSelectedAccounts([])
  }

  const handleSelectAll = () => {
    setSelectedAccounts(sortedAccounts.map((account) => account.id))
  }

  const handleTypeChange = (selected: { label: string; value: string }[]) => {
    if (!selected || selected.length === 0) {
      // If cleared, default back to "All Types"
      setSelectedTypes([{ label: "All Types", value: "all" }])
      return
    }

    const hasAllTypes = selected.some((item) => item.value === "all")
    const newSelection = selected[selected.length - 1] // Most recently selected item

    if (newSelection.value === "all") {
      // User selected "All Types" - clear other selections
      setSelectedTypes([{ label: "All Types", value: "all" }])
    } else if (hasAllTypes && selected.length > 1) {
      // User selected a specific type while "All Types" was selected - remove "All Types"
      setSelectedTypes(selected.filter((item) => item.value !== "all"))
    } else {
      // Normal multi-select behavior
      setSelectedTypes(selected)
    }
  }

  const handlePreviewData = async () => {
    try {
      const result = await exportMutation.mutateAsync({
        selectedAccounts,
        selectedTypes,
        timeframeOption,
        customDateRange,
        accounts: sortedAccounts,
        firstPageOnly: true
      })

      setPreviewData(result as PreviewData[])
    } catch (error) {
      console.error("Preview error:", error)
    }
  }

  const handleExportCSV = async () => {
    try {
      await exportMutation.mutateAsync({
        selectedAccounts,
        selectedTypes,
        timeframeOption,
        customDateRange,
        accounts: sortedAccounts
      })

      // Close modal on success
      setOpenModal(false)
    } catch (error) {
      // Error is handled by mutation state
      console.error("Export error:", error)
    }
  }

  return (
    <div className="w-full">
      <Header />
      <div className="w-full p-8 mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-6">Export Activities</h1>

        {accountsLoading && (
          <div className="flex items-center justify-center w-full py-12">
            <Spinner className="h-12 w-12" />
          </div>
        )}

        {!accountsLoading && accountsData?.accounts && (
          <div className="rounded-lg bg-white shadow border-2 border-gray-300">
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Accounts to Export
                  </label>
                  <div className="flex items-center gap-4">
                    {selectedAccounts.length > 0 ? (
                      <>
                        <span className="text-sm text-gray-500">
                          {selectedAccounts.length} account
                          {selectedAccounts.length !== 1 ? "s" : ""} selected
                        </span>
                        <button
                          onClick={handleClearAll}
                          className="text-sm text-blue-500 hover:text-blue-600">
                          Clear all
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleSelectAll}
                        className="text-sm text-blue-500 hover:text-blue-600">
                        Select all
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {sortedAccounts.map((account) => (
                    <label
                      key={account.id}
                      className={`
                          relative flex items-center justify-between p-3 cursor-pointer
                          border-2 rounded-lg hover:bg-gray-50 transition-colors
                          ${
                            selectedAccounts.includes(account.id)
                              ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
                              : "border-gray-300 bg-white"
                          }
                        `}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedAccounts.includes(account.id)}
                        onChange={() => handleAccountToggle(account.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-0.5">
                          {getAccountDisplayName(account)}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs text-gray-600">
                            {getAccountTypeLabel(account.type)} •{" "}
                            {account.currency}
                          </p>
                          {isManaged(account.unifiedAccountType) && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              Managed
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`
                            w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ml-3
                            ${
                              selectedAccounts.includes(account.id)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }
                          `}>
                        {selectedAccounts.includes(account.id) && (
                          <Check
                            className="w-3 h-3 text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Filters Row */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type
                      </label>
                      <Select
                        value={selectedTypes}
                        onChange={(selected) =>
                          handleTypeChange(
                            selected as { label: string; value: string }[]
                          )
                        }
                        options={ACTIVITY_TYPE_OPTIONS}
                        isMulti={true}
                        closeMenuOnSelect={false}
                        placeholder="All Types"
                        isClearable={false}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderWidth: "2px",
                            borderColor: state.isFocused
                              ? "#3b82f6"
                              : "#d1d5db",
                            borderRadius: "0.5rem",
                            minHeight: "42px",
                            fontSize: "0.875rem",
                            "&:hover": {
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : "#d1d5db",
                              backgroundColor: "#f9fafb"
                            },
                            boxShadow: state.isFocused
                              ? "0 0 0 2px rgba(59, 130, 246, 0.1)"
                              : "none"
                          }),
                          menu: (base) => ({
                            ...base,
                            borderWidth: "2px",
                            borderColor: "#d1d5db",
                            borderRadius: "0.5rem",
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            overflow: "hidden"
                          }),
                          menuList: (base) => ({
                            ...base,
                            maxHeight: "256px",
                            padding: "0.5rem"
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#eff6ff"
                              : state.isFocused
                                ? "#f9fafb"
                                : "white",
                            color: state.isSelected ? "#2563eb" : "#374151",
                            fontSize: "0.875rem",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontWeight: state.isSelected ? "500" : "400",
                            "&:active": {
                              backgroundColor: "#eff6ff"
                            }
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#eff6ff",
                            borderRadius: "0.375rem"
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "#2563eb",
                            fontSize: "0.75rem"
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "#2563eb",
                            "&:hover": {
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8"
                            }
                          })
                        }}
                      />
                    </div>

                    {/* Timeframe Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeframe
                      </label>
                      <Select
                        value={timeframeOption}
                        onChange={(selected) =>
                          setTimeframeOption(
                            selected as { label: string; value: string }
                          )
                        }
                        options={ACTIVITY_TIMEFRAME_PRESETS}
                        isMulti={false}
                        placeholder="Select timeframe"
                        isClearable={false}
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            borderWidth: "2px",
                            borderColor: state.isFocused
                              ? "#3b82f6"
                              : "#d1d5db",
                            borderRadius: "0.5rem",
                            minHeight: "42px",
                            fontSize: "0.875rem",
                            "&:hover": {
                              borderColor: state.isFocused
                                ? "#3b82f6"
                                : "#d1d5db",
                              backgroundColor: "#f9fafb"
                            },
                            boxShadow: state.isFocused
                              ? "0 0 0 2px rgba(59, 130, 246, 0.1)"
                              : "none"
                          }),
                          menu: (base) => ({
                            ...base,
                            borderWidth: "2px",
                            borderColor: "#d1d5db",
                            borderRadius: "0.5rem",
                            boxShadow:
                              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            overflow: "hidden"
                          }),
                          menuList: (base) => ({
                            ...base,
                            padding: "0.5rem"
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#eff6ff"
                              : state.isFocused
                                ? "#f9fafb"
                                : "white",
                            color: state.isSelected ? "#2563eb" : "#374151",
                            fontSize: "0.875rem",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontWeight: state.isSelected ? "500" : "400",
                            "&:active": {
                              backgroundColor: "#eff6ff"
                            }
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "#374151"
                          })
                        }}
                      />

                      {/* Custom Date Range */}
                      {timeframeOption.value === "custom" && (
                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <DatePickerField
                            label="Start Date"
                            value={customDateRange.startDate}
                            onChange={(date) =>
                              setCustomDateRange((prev) => ({
                                ...prev,
                                startDate: date
                              }))
                            }
                          />
                          <DatePickerField
                            label="End Date"
                            value={customDateRange.endDate}
                            onChange={(date) =>
                              setCustomDateRange((prev) => ({
                                ...prev,
                                endDate: date
                              }))
                            }
                            maxValue={today("America/New_York")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    color="gray"
                    onClick={handlePreviewData}
                    disabled={selectedAccounts.length === 0 || exportMutation.isPending}>
                    {exportMutation.isPending ? "Loading..." : "Preview Data"}
                  </Button>
                  <Button
                    color="blue"
                    onClick={handleOpenModal}
                    disabled={selectedAccounts.length === 0}>
                    Export to CSV
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Table */}
        {previewData && (
          <div className="mt-6 rounded-lg bg-white shadow border-2 border-gray-300">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Data Preview
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Showing first 50 activities matching your filters
                  </p>
                </div>
                <Button
                  color="gray"
                  size="sm"
                  onClick={() => setPreviewData(null)}>
                  Close Preview
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Security
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.date}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.accountName}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.activityType}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {row.description}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.amount}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.security}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.quantity}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {row.status}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {row.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Modal - Centered on screen */}
      <Dialog open={openModal} handler={handleOpenModal} size="md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Export to CSV</h3>
            <button
              type="button"
              onClick={handleOpenModal}
              className="p-1 rounded-full hover:bg-gray-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="py-4">
            {exportMutation.isPending ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Spinner className="h-12 w-12 mb-4" />
                <p className="text-gray-700 font-medium">Generating CSV...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Fetching activities from {selectedAccounts.length} account
                  {selectedAccounts.length !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4">
                  You are about to export activities from{" "}
                  {selectedAccounts.length} selected account
                  {selectedAccounts.length !== 1 ? "s" : ""}.
                </p>

                {/* Show timeframe info */}
                <p className="text-gray-600 text-sm mb-2">
                  Timeframe:{" "}
                  <span className="font-medium">{timeframeOption.label}</span>
                  {timeframeOption.value === "custom" &&
                    customDateRange.startDate &&
                    customDateRange.endDate && (
                      <>
                        {" "}
                        ({customDateRange.startDate.toString()} to{" "}
                        {customDateRange.endDate.toString()})
                      </>
                    )}
                </p>

                {/* Show error if any */}
                {exportMutation.isError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">
                      {exportMutation.error instanceof Error
                        ? exportMutation.error.message
                        : "Failed to export activities"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              color="gray"
              onClick={handleOpenModal}
              disabled={exportMutation.isPending}>
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleExportCSV}
              disabled={exportMutation.isPending}>
              {exportMutation.isPending ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function ExportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <WsExportPage />
    </QueryClientProvider>
  )
}

export default ExportPage
