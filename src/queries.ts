import { useMutation, useQuery } from "@tanstack/react-query"

import { sendToBackground } from "@plasmohq/messaging"

import type { CashAccount, FeedItem, FilterValues, PositionEdge } from "~types"
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
