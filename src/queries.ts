import { useMutation, useQuery } from "@tanstack/react-query"

import { sendToBackground } from "@plasmohq/messaging"

import type { CashAccount, FeedItem, FilterValues, PositionEdge } from "~types"
import { TYPE_TO_QUERY_TYPE_MAP } from "~utils/constants"
import { getCookie } from "~utils/cookie"
import {
  fetchAllAccounts,
  getAccountsActivities,
  getAllAccountFiniancials,
  getAllDivItems
} from "~utils/graphql"
import {
  getFeedItems,
  getFilterValsFromDB,
  syncDivTransactionInDB,
  writeDataToDB
} from "~utils/idb"
import { getDivFrequencyForSymbols } from "~utils/stocks"
import { formatAllAccFiniancialData } from "~utils/wealthsimple"

const DAYS_IN_MS = 24 * 60 * 60 * 1000

const getRespFromBackground = async () => {
  const allData = await sendToBackground({ name: "getAllAccountDivs" })

  const { cashResp, tradeResp, managedRes, createdAt } = allData

  let isOldData = false
  if (createdAt) {
    const createdAtDate = new Date(createdAt)
    const now = new Date()
    const diff = now.getTime() - createdAtDate.getTime()
    if (diff > DAYS_IN_MS) {
      isOldData = true
    }
  }

  if (!cashResp && !tradeResp && !managedRes) {
    return {
      cashResp: null,
      tradeResp: null,
      managedRes: null,
      isOldData: undefined
    }
  }

  return { cashResp, tradeResp, managedRes, isOldData }
}

export const useFetchRespFromBgQuery = () =>
  useQuery({
    queryKey: ["fetchRespFromBg"],
    queryFn: getRespFromBackground
  })

const fetchDivDetails = async (): Promise<{
  feedItems: FeedItem[]
  isOldData?: boolean
  needLogin?: boolean
  filterValues?: FilterValues
}> => {
  const feedInDB = await getFeedItems()
  // const feedInDB = null
  const cookies = await getCookie()

  if (!cookies) {
    if (feedInDB) {
      const filterValues = await getFilterValsFromDB()
      return {
        ...feedInDB,
        filterValues
      }
    }

    return {
      feedItems: [],
      isOldData: false,
      needLogin: true
    }
  }

  const decodedCookie = decodeURIComponent(cookies.value)
  const parsedCookie = JSON.parse(decodedCookie)

  const idenitityId = parsedCookie.identity_canonical_id
  const accessToken = parsedCookie.access_token

  await syncDivTransactionInDB(accessToken)

  if (feedInDB && !feedInDB.isOldData) {
    const filterValues = await getFilterValsFromDB()
    return {
      ...feedInDB,
      filterValues
    }
  }

  const allAccFiniancials = await getAllAccountFiniancials(
    accessToken,
    idenitityId
  )

  const formattedAccts = formatAllAccFiniancialData(allAccFiniancials)
  const openAccs = formattedAccts.filter(
    (acct) => acct.status?.toLowerCase() === "open"
  )
  const accountsData = openAccs.map((acct) => {
    return {
      accountId: acct.id,
      type: acct.type,
      unifiedAccountType: acct.unifiedAccountType
    }
  })

  const allDivActivities = await getAllDivItems(accessToken, accountsData)

  await writeDataToDB(allDivActivities, formattedAccts)

  const filterValues = await getFilterValsFromDB()

  return {
    feedItems: allDivActivities,
    filterValues,
    isOldData: false
  }
}

export const useFetchDivDetailsQuery = () =>
  useQuery({
    queryKey: ["fetchDivDetails"],
    queryFn: () => fetchDivDetails(),
    refetchOnWindowFocus: false
  })

const typeMapping = {
  SEND_RECEIVED: "Cash Received",
  SEND: "Cash Sent"
}

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getCashAccountsFromBackground = async (): Promise<{
  cashAccounts: CashAccount[] | null
  isOldData?: boolean
}> => {
  const data = await sendToBackground({ name: "getCashAccounts" })

  const { cashAccounts, createdAt } = data

  let isOldData = false
  if (createdAt) {
    const createdAtDate = new Date(createdAt)
    const now = new Date()
    const diff = now.getTime() - createdAtDate.getTime()
    if (diff > DAYS_IN_MS) {
      isOldData = true
    }
  }

  return { cashAccounts, isOldData }
}

export const useFetchCashAccountsQuery = () =>
  useQuery({
    queryKey: ["fetchCashAccounts"],
    queryFn: getCashAccountsFromBackground,
    refetchOnWindowFocus: false
  })

const getIdentityPositionsFromBackground = async (): Promise<{
  positions: PositionEdge[] | null
  isOldData?: boolean
}> => {
  const data = await sendToBackground({ name: "getIdentityPositions" })

  const { positions, createdAt, error } = data

  if (error || !positions) {
    return { positions: null, isOldData: false }
  }

  let isOldData = false
  if (createdAt) {
    const createdAtDate = new Date(createdAt)
    const now = new Date()
    const diff = now.getTime() - createdAtDate.getTime()
    if (diff > DAYS_IN_MS) {
      isOldData = true
    }
  }

  // Filter out OPTION securities and only keep equity/ETF positions
  const filteredPositions = positions.filter(
    (edge: PositionEdge) => edge.node.security.securityType !== "OPTION"
  )

  console.log("Filtered positions:", filteredPositions)

  if (filteredPositions && filteredPositions.length > 0) {
    const allSymbols = filteredPositions
      .map((position) => position?.node.security.stock.symbol)
      .filter((symbol) => !!symbol)

    const allDivFrequencies = await getDivFrequencyForSymbols(allSymbols)

    console.log("All dividend frequencies:", allDivFrequencies)
  }

  return { positions: filteredPositions, isOldData }
}

export const useFetchIdentityPositionsQuery = () =>
  useQuery({
    queryKey: ["fetchIdentityPositions"],
    queryFn: getIdentityPositionsFromBackground,
    refetchOnWindowFocus: false
  })

const fetchAllAccountsFromAPI = async (): Promise<{
  accounts: Array<{
    id: string
    nickname: string
    type: string
    unifiedAccountType: string
    status: string
    currency: string
  }> | null
  needLogin?: boolean
}> => {
  const cookies = await getCookie()

  if (!cookies) {
    return {
      accounts: null,
      needLogin: true
    }
  }

  const decodedCookie = decodeURIComponent(cookies.value)
  const parsedCookie = JSON.parse(decodedCookie)

  const identityId = parsedCookie.identity_canonical_id
  const accessToken = parsedCookie.access_token

  const response = await fetchAllAccounts(accessToken, identityId)

  if (!response?.data?.identity?.accounts?.edges) {
    return {
      accounts: null
    }
  }

  const accounts = response.data.identity.accounts.edges
    .map((edge: any) => edge.node)
    .filter(
      (account: any) =>
        account.status?.toLowerCase() === "open" && account?.archivedAt === null
    )
    .map((account: any) => ({
      id: account.id,
      nickname: account.nickname || "",
      type: account.type || "",
      unifiedAccountType: account.unifiedAccountType || "",
      status: account.status || "",
      currency: account.currency || ""
    }))

  return {
    accounts
  }
}

export const useFetchAllAccountsQuery = () =>
  useQuery({
    queryKey: ["fetchAllAccounts"],
    queryFn: fetchAllAccountsFromAPI,
    refetchOnWindowFocus: false
  })

export const useExportCashTransactionsQuery = () =>
  useMutation({
    mutationFn: async (data: {
      accounts: { id: string; name: string; nickname: string }[]
    }) => {
      const cookies = await getCookie()
      if (!cookies) {
        throw new Error("No cookies found")
      }

      const decodedCookie = decodeURIComponent(cookies.value)
      const parsedCookie = JSON.parse(decodedCookie)

      const accessToken = parsedCookie.access_token
      const accountIds = data.accounts.map((acc) => acc.id)

      const activities: FeedItem[] = await getAccountsActivities(
        accessToken,
        accountIds
      )

      // Convert activities to CSV
      const headers = [
        "Date",
        "Title",
        "Amount",
        "Account",
        "Nickname",
        "Status"
      ]

      const csvRows = [headers.join(",")]

      activities.forEach((item) => {
        // Format amount with currency and +/- sign
        const formattedAmount = `${item.amountSign === "negative" ? "-" : "+"}${item.amount} ${item.currency}`

        // Format date to YYYY-MM-DD
        const formattedDate = new Date(item.occurredAt)
          .toISOString()
          .split("T")[0]

        // Find account name
        const accountName =
          data.accounts.find((acc) => acc.id === item.accountId)?.name ||
          item.accountId

        let title = ""

        if (item.type.includes("P2P")) {
          title = typeMapping[item.subType]
        } else if (item.type === "INTEREST") {
          title = "Interest"
        } else if (item.spendMerchant || item.aftOriginatorName) {
          title = item.spendMerchant || item.aftOriginatorName || ""
        } else {
          title = toTitleCase(item.type)
        }

        const row = [
          formattedDate,
          title,
          formattedAmount,
          accountName,
          data.accounts.find((acc) => acc.id === item.accountId)?.nickname ||
            "",
          item.status
        ].map((field) => {
          if (field && field.toString().includes(",")) {
            return `"${field}"`
          }
          return field
        })

        csvRows.push(row.join(","))
      })

      const csvContent = csvRows.join("\n")

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `cash_transactions_${new Date().toISOString()}.csv`
      )
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      return activities
    }
  })

// Helper function to get account display name for CSV
function getAccountDisplayName(account: {
  nickname: string
  type: string
  unifiedAccountType: string
}): string {
  if (account.nickname) {
    return account.nickname
  }

  const unifiedType = account.unifiedAccountType || ""

  if (unifiedType.includes("CREDIT_CARD")) {
    return "Wealthsimple credit card"
  }

  if (unifiedType === "CASH") {
    return "Personal Chequing"
  }

  if (unifiedType.includes("DIRECT_INDEX")) {
    return "Direct Indexing"
  }

  if (unifiedType.includes("CRYPTO")) {
    return "Crypto"
  }

  let baseType = unifiedType
  if (unifiedType.includes("MANAGED_")) {
    baseType = unifiedType.replace("MANAGED_", "")
  } else if (unifiedType.includes("SELF_DIRECTED_")) {
    baseType = unifiedType.replace("SELF_DIRECTED_", "")
  }

  if (baseType.includes("CORPORATE_SAVE")) {
    return "Corporate Save"
  }

  if (baseType.includes("HISA")) {
    return "High Interest Savings"
  }

  let displayName = ""

  if (baseType.includes("JOINT")) {
    displayName = "Joint "
    baseType = baseType.replace("JOINT_", "")
  }

  if (baseType.includes("TFSA")) {
    displayName += "TFSA"
  } else if (baseType.includes("RRSP")) {
    displayName += "RRSP"
  } else if (baseType.includes("NON_REGISTERED")) {
    displayName += "Non-registered"
  } else if (baseType.includes("CORPORATE")) {
    displayName += "Corporate investing"
  } else {
    displayName += baseType.replace(/_/g, " ")
  }

  if (baseType.includes("MARGIN")) {
    displayName += " margin"
  }

  return displayName || account.type.replace(/_/g, " ")
}

// Helper function to format activity type for CSV
function formatActivityType(type: string): string {
  const typeMap: Record<string, string> = {
    DIY_BUY: "Buy",
    DIY_SELL: "Sell",
    MANAGED_BUY: "Buy (Managed)",
    MANAGED_SELL: "Sell (Managed)",
    OPTIONS_BUY: "Buy Option",
    OPTIONS_SELL: "Sell Option",
    CRYPTO_BUY: "Buy Crypto",
    CRYPTO_SELL: "Sell Crypto",
    DIVIDEND: "Dividend",
    STOCK_DIVIDEND: "Stock Dividend",
    INTEREST: "Interest",
    INTERNAL_TRANSFER: "Transfer",
    DEPOSIT: "Deposit",
    WITHDRAWAL: "Withdrawal",
    SPEND: "Purchase",
    PREPAID_SPEND: "Purchase",
    CREDIT_CARD: "Credit Card",
    FEE: "Fee",
    REFUND: "Refund",
    REIMBURSEMENT: "Reimbursement",
    PROMOTION: "Promotion",
    REFERRAL: "Referral",
    AFFILIATE: "Affiliate Bonus"
  }

  return typeMap[type] || toTitleCase(type)
}

// Helper function to generate description for activity
function getActivityDescription(
  activity: any,
  accounts: Array<{
    id: string
    nickname: string
    type: string
    unifiedAccountType: string
  }>
): string {
  const {
    type,
    subType,
    assetSymbol,
    assetQuantity,
    spendMerchant,
    aftOriginatorName,
    eTransferName,
    billPayPayeeNickname,
    billPayCompanyName,
    opposingAccountId
  } = activity

  // Trading activities
  if (
    type === "DIY_BUY" ||
    type === "MANAGED_BUY" ||
    type === "CRYPTO_BUY" ||
    type === "OPTIONS_BUY"
  ) {
    const orderType = subType?.replace(/_/g, " ").toLowerCase() || "order"
    if (assetSymbol && assetQuantity) {
      return `Buy ${assetQuantity} ${assetSymbol} (${orderType})`
    }
    return `Buy order (${orderType})`
  }

  if (
    type === "DIY_SELL" ||
    type === "MANAGED_SELL" ||
    type === "CRYPTO_SELL" ||
    type === "OPTIONS_SELL"
  ) {
    const orderType = subType?.replace(/_/g, " ").toLowerCase() || "order"
    if (assetSymbol && assetQuantity) {
      return `Sell ${assetQuantity} ${assetSymbol} (${orderType})`
    }
    return `Sell order (${orderType})`
  }

  // Dividends
  if (type === "DIVIDEND" || type === "STOCK_DIVIDEND") {
    return assetSymbol ? `Dividend from ${assetSymbol}` : "Dividend"
  }

  // Interest
  if (type === "INTEREST") {
    return "Interest earned"
  }

  // Transfers
  if (type === "INTERNAL_TRANSFER") {
    if (opposingAccountId) {
      const opposingAccount = accounts.find(
        (acc) => acc.id === opposingAccountId
      )
      const opposingName = opposingAccount
        ? getAccountDisplayName(opposingAccount)
        : "account"
      const direction = subType === "SOURCE" ? "to" : "from"
      return `Transfer ${direction} ${opposingName}`
    }
    return "Internal transfer"
  }

  // Purchases
  if (type === "CREDIT_CARD" || type === "SPEND" || type === "PREPAID_SPEND") {
    if (spendMerchant) {
      return spendMerchant
    }
    if (subType === "REFUND") {
      return "Refund"
    }
    return "Purchase"
  }

  // Withdrawals
  if (type === "WITHDRAWAL") {
    if (billPayPayeeNickname) {
      return `Bill payment: ${billPayPayeeNickname}`
    }
    if (billPayCompanyName) {
      return `Bill payment: ${billPayCompanyName}`
    }
    if (aftOriginatorName) {
      return `Withdrawal to ${aftOriginatorName}`
    }
    return "Withdrawal"
  }

  // Deposits
  if (type === "DEPOSIT") {
    if (eTransferName) {
      return `Deposit from ${eTransferName}`
    }
    if (subType === "E_TRANSFER") {
      return "E-transfer deposit"
    }
    if (subType === "EFT") {
      return "EFT deposit"
    }
    return "Deposit"
  }

  // Refunds/Reimbursements
  if (type === "REFUND" || type === "REIMBURSEMENT") {
    if (spendMerchant) {
      return `Refund from ${spendMerchant}`
    }
    if (subType === "ATM") {
      return "ATM fee reimbursement"
    }
    return "Refund"
  }

  // Promotions/Bonuses
  if (type === "PROMOTION" || type === "REFERRAL" || type === "AFFILIATE") {
    return formatActivityType(type)
  }

  // Default
  return formatActivityType(type)
}

export const useExportActivitiesMutation = () =>
  useMutation({
    mutationFn: async (data: {
      selectedAccounts: string[]
      selectedTypes: { label: string; value: string }[]
      timeframeOption: { label: string; value: string }
      customDateRange: {
        startDate: any | null
        endDate: any | null
      }
      accounts: Array<{
        id: string
        nickname: string
        type: string
        unifiedAccountType: string
      }>
      firstPageOnly?: boolean
    }) => {
      // 1. Get access token from cookie
      const cookie = await getCookie()
      if (!cookie) {
        throw new Error("Not authenticated. Please log in to WealthSimple.")
      }

      const parsedCookie = JSON.parse(decodeURIComponent(cookie.value))
      const accessToken = parsedCookie.access_token

      // 2. Calculate date range based on timeframe selection
      let startDate: string | undefined
      let endDate: string | undefined

      if (data.timeframeOption.value === "custom") {
        // Use custom date range - convert CalendarDate to ISO string
        const startCalDate = data.customDateRange.startDate
        const endCalDate = data.customDateRange.endDate

        if (!startCalDate || !endCalDate) {
          throw new Error(
            "Please select both start and end dates for custom range."
          )
        }

        // Convert CalendarDate to ISO format
        const startJsDate = new Date(
          startCalDate.year,
          startCalDate.month - 1,
          startCalDate.day
        )
        const endJsDate = new Date(
          endCalDate.year,
          endCalDate.month - 1,
          endCalDate.day
        )

        const formatToISO = (date: Date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, "0")
          const day = String(date.getDate()).padStart(2, "0")
          return `${year}-${month}-${day}T00:00:00.000Z`
        }

        startDate = formatToISO(startJsDate)
        endDate = formatToISO(endJsDate)
      } else if (data.timeframeOption.value !== "all") {
        // Use preset timeframe
        const now = new Date()
        let daysAgo = 0

        switch (data.timeframeOption.value) {
          case "7d":
            daysAgo = 7
            break
          case "30d":
            daysAgo = 30
            break
          case "60d":
            daysAgo = 60
            break
          case "90d":
            daysAgo = 90
            break
        }

        if (daysAgo > 0) {
          const startDateObj = new Date(
            now.getTime() - daysAgo * 24 * 60 * 60 * 1000
          )
          startDate = startDateObj.toISOString()
        }
      }

      // 3. Determine types filter
      const hasAllTypes = data.selectedTypes.some(
        (item) => item.value === "all"
      )
      const typesFilter = hasAllTypes
        ? undefined
        : data.selectedTypes.flatMap(
            (t) => TYPE_TO_QUERY_TYPE_MAP[t.value] || []
          )

      // 4. Fetch activities
      const activities = await getAccountsActivities(
        accessToken,
        data.selectedAccounts,
        typesFilter,
        startDate,
        endDate,
        data.firstPageOnly
      )

      if (!activities || activities.length === 0) {
        throw new Error(
          "No activities found for the selected accounts and timeframe."
        )
      }

      // 5. Format activities data (for both CSV and preview)
      const formattedActivities = activities.map((activity) => {
        // Format date
        const date = activity.occurredAt
          ? new Date(activity.occurredAt).toISOString().split("T")[0]
          : ""

        // Get account name
        const account = data.accounts.find(
          (acc) => acc.id === activity.accountId
        )
        const accountName = account
          ? getAccountDisplayName(account)
          : activity.accountId

        // Format activity type
        const activityType = formatActivityType(activity.type)

        // Generate description
        const description = getActivityDescription(activity, data.accounts)

        // Format amount with sign and currency
        const sign = activity.amountSign === "negative" ? "-" : "+"
        const amount = activity.amount
          ? `${sign}${activity.amount} ${activity.currency}`
          : ""

        // Security and quantity
        const security = activity.assetSymbol || ""
        const quantity = activity.assetQuantity || ""

        // Status
        const status = activity.status || ""

        // Additional notes (context-specific)
        let notes = ""
        if (activity.eTransferEmail) {
          notes = activity.eTransferEmail
        } else if (
          activity.billPayCompanyName &&
          activity.billPayPayeeNickname
        ) {
          notes = `${activity.billPayCompanyName} - ${activity.billPayPayeeNickname}`
        } else if (activity.aftOriginatorName) {
          notes = activity.aftOriginatorName
        } else if (activity.subType && activity.type === "CREDIT_CARD" && activity.subType === "REFUND") {
          notes = "Refund"
        }

        return {
          date,
          accountName,
          activityType,
          description,
          amount,
          security,
          quantity,
          status,
          notes
        }
      })

      // If preview mode, return formatted data
      if (data.firstPageOnly) {
        return formattedActivities
      }

      // 6. Convert to CSV
      const headers = [
        "Date",
        "Account",
        "Type",
        "Description",
        "Amount",
        "Security",
        "Quantity",
        "Status",
        "Notes"
      ]

      const csvRows = formattedActivities.map((row) => [
        row.date,
        row.accountName,
        row.activityType,
        row.description,
        row.amount,
        row.security,
        row.quantity,
        row.status,
        row.notes
      ])

      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) =>
          row
            .map((cell) =>
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"'))
                ? `"${cell.replace(/"/g, '""')}"`
                : cell
            )
            .join(",")
        )
      ].join("\n")

      // 6. Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      const timestamp = new Date().toISOString().split("T")[0]
      const filename = `wealthsimple-activities-${timestamp}.csv`

      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return activities
    }
  })
