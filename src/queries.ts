import { useQuery } from "@tanstack/react-query"

import { sendToBackground } from "@plasmohq/messaging"

import type { FeedItem, FilterValues } from "~types"
import { getCookie } from "~utils/cookie"
import { getAllAccountFiniancials, getAllDivItems } from "~utils/graphql"
import {
  getFeedItems,
  getFilterValsFromDB,
  syncDivTransactionInDB,
  writeDataToDB
} from "~utils/idb"
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

  if (!cashResp || !tradeResp || !managedRes) {
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
