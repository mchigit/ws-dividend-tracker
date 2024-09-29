import Dexie, { type EntityTable } from "dexie"

import type { FeedItem } from "~types"

const DB_NAME = "ws-div-db"
const OBJ_STORES = {
  FEED: "feedItems",
  LAST_SYNCED: "lastSynced"
}

const DB_VERSION = 1

export interface LastSynced {
  timestamp: number
  canonicalId: string
}

export const db = new Dexie(DB_NAME) as Dexie & {
  feedItems: EntityTable<FeedItem, "canonicalId">
  lastSynced: EntityTable<LastSynced, "canonicalId">
}

db.version(DB_VERSION).stores({
  [OBJ_STORES.FEED]: "canonicalId",
  [OBJ_STORES.LAST_SYNCED]: "canonicalId, timestamp"
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
  if (lastSyncedTime >= oneDayAgo) {
    return {
      feedItems: allFeedItems
    }
  } else {
    return {
      feedItems: allFeedItems,
      isOldData: true
    }
  }
}

export const writeToFeedDB = async (feedItems: FeedItem[]) => {
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
