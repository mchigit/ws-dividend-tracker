import { useQuery } from "@tanstack/react-query"

import { sendToBackground } from "@plasmohq/messaging"

import { getCookie } from "~utils/cookie"
import { getAllAccountFiniancials, getAllDivItems } from "~utils/graphql"
import { formatAllAccFiniancialData } from "~utils/wealthsimple"

const DAYS_IN_MS = 24 * 60 * 60 * 1000

const getRespFromBackground = async () => {
  const [cashResp, tradeResp, managedRes, cashInterests] = await Promise.all([
    sendToBackground({ name: "getCashDiv" }),
    sendToBackground({ name: "getTradeDividend" }),
    sendToBackground({ name: "getManagedAcc" }),
    sendToBackground({ name: "getCashInterests" })
  ])

  let isOldData = false
  if (cashResp?.createdAt) {
    const createdAt = new Date(cashResp.createdAt)
    const now = new Date()
    const diff = now.getTime() - createdAt.getTime()
    if (diff > DAYS_IN_MS) {
      isOldData = true
    }
  }

  // console.log({
  //   cashResp,
  //   tradeResp,
  //   managedRes,
  //   cashInterests
  // })

  if (!cashResp || !tradeResp || !managedRes || !cashInterests) {
    return {
      cashResp: null,
      tradeResp: null,
      managedRes: null,
      cashInterests: null,
      isOldData
    }
  }

  if (
    cashResp?.error ||
    tradeResp?.error ||
    managedRes?.error ||
    cashInterests?.error
  ) {
    return {
      cashResp: null,
      tradeResp: null,
      managedRes: null,
      cashInterests: null,
      isOldData
    }
  }

  return { cashResp, tradeResp, managedRes, cashInterests, isOldData }
}

export const useFetchRespFromBgQuery = () =>
  useQuery({
    queryKey: ["fetchRespFromBg"],
    queryFn: getRespFromBackground
  })

const fetchDivDetails = async () => {
  const cookies = await getCookie()

  if (!cookies) {
    return null
  }

  const decodedCookie = decodeURIComponent(cookies.value)
  const parsedCookie = JSON.parse(decodedCookie)

  const idenitityId = parsedCookie.identity_canonical_id
  const accessToken = parsedCookie.access_token

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

  return allDivActivities
}

export const useFetchDivDetailsQuery = () =>
  useQuery({
    queryKey: ["fetchDivDetails"],
    queryFn: fetchDivDetails
  })
