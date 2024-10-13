import type { Account, FeedItem } from "~types"

export const formatAllAccFiniancialData = (data: any) => {
  const accounts = data["data"]["identity"]["accounts"]["edges"]

  const formattedAccounts: Account[] = accounts.map((accountObj: any) => {
    const account = accountObj.node

    return {
      id: account.id,
      currency: account.currency,
      nickname: account.nickname,
      status: account.status,
      type: account.type,
      financials: account.financials,
      unifiedAccountType: account.unifiedAccountType
    }
  })

  return formattedAccounts
}

export const formatFeedItemResp = (data: any): FeedItem[] | null => {
  const feedItems = data?.data?.activityFeedItems?.edges
  if (!feedItems) return null
  const formattedFeedItems: FeedItem[] = feedItems.map((item: any) => {
    const node = item.node

    return {
      accountId: node.accountId,
      amount: node.amount,
      currency: node.currency,
      occurredAt: node.occurredAt,
      type: node.type,
      unifiedAccountType: node.unifiedAccountType,
      assetSymbol: node.assetSymbol,
      canonicalId: node.canonicalId,
      securityId: node.securityId
    }
  })

  return formattedFeedItems
}

export function categFeedItemByUnifiedType(feedItems: FeedItem[]) {
  const selfDirectedItems = feedItems.filter((item) =>
    item.unifiedAccountType.toLowerCase().includes("self_directed")
  )

  const managedItems = feedItems.filter((item) =>
    item.unifiedAccountType.toLowerCase().includes("managed")
  )

  const cashItems = feedItems.filter((item) =>
    item.unifiedAccountType.toLowerCase().includes("cash")
  )

  return {
    selfDirectedItems,
    managedItems,
    cashItems
  }
}
