import { useQuery } from "@tanstack/react-query"

import { sendToBackground } from "@plasmohq/messaging"

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
