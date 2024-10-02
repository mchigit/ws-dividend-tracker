import Dexie, { type EntityTable } from "dexie"

import type { Account, FeedItem } from "~types"

import { getAllDivItems } from "./graphql"

const DB_NAME = "ws-div-db"
const OBJ_STORES = {
  FEED: "feedItems",
  LAST_SYNCED: "lastSynced",
  USER_ACCOUNTS: "userAccounts"
}

const DB_VERSION = 3

export interface LastSynced {
  timestamp: number
  canonicalId: string
}

export const db = new Dexie(DB_NAME) as Dexie & {
  feedItems: EntityTable<FeedItem, "canonicalId">
  lastSynced: EntityTable<LastSynced, "canonicalId">
  userAccounts: EntityTable<Account, "id">
}

db.version(DB_VERSION).stores({
  [OBJ_STORES.FEED]: "canonicalId, accountId, occurredAt",
  [OBJ_STORES.LAST_SYNCED]: "canonicalId, timestamp",
  [OBJ_STORES.USER_ACCOUNTS]: "id, type, unifiedAccountType"
})

export const getFeedItems = async (): Promise<{
  feedItems: FeedItem[]
  isOldData?: boolean
} | null> => {
  const lastSync = await db.lastSynced.orderBy("timestamp").last()
  const allFeedItems = await db.feedItems.toArray()

  if (!allFeedItems || !allFeedItems.length) return null
  if (!lastSync) return null

  const lastSyncedTime = lastSync.timestamp
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000

  const sortedFeedItems = allFeedItems.sort((a, b) => {
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  })

  if (lastSyncedTime >= oneDayAgo) {
    return {
      feedItems: sortedFeedItems
    }
  } else {
    return {
      feedItems: sortedFeedItems,
      isOldData: true
    }
  }
}

export const writeDataToDB = async (
  feedItems: FeedItem[],
  accounts: Account[]
) => {
  await db.userAccounts.bulkPut(accounts)
  await db.feedItems.bulkPut(feedItems)

  feedItems.sort((a, b) => {
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  })

  const lastSynced = {
    timestamp: Date.now(),
    canonicalId: feedItems[0].canonicalId
  }

  await db.lastSynced.put(lastSynced)
}

export async function syncDivTransactionInDB(accessToken: string) {
  const latestFeed = await db.feedItems.orderBy("occurredAt").last()
  const accounts = await db.userAccounts.toArray()

  const accountIds = accounts.map((account) => {
    return {
      accountId: account.id,
      type: account.type,
      unifiedAccountType: account.unifiedAccountType
    }
  })

  const divItemsAfterLast = await getAllDivItems(
    accessToken,
    accountIds,
    latestFeed
  )

  if (!divItemsAfterLast || divItemsAfterLast.length === 0) return

  await db.feedItems.bulkPut(divItemsAfterLast)

  divItemsAfterLast.sort((a, b) => {
    return new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  })

  const lastSynced = {
    timestamp: Date.now(),
    canonicalId: divItemsAfterLast[0].canonicalId
  }

  await db.lastSynced.put(lastSynced)
}
