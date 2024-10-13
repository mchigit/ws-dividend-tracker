import type { FeedItem } from "~types"

import { generateTimestampNow } from "./shared"
import { formatFeedItemResp } from "./wealthsimple"

const WS_GRAPHQL_URL = "https://my.wealthsimple.com/graphql"

export function getYearlyTotal(balance: number, interestRate: number) {
  return balance * interestRate
}

export async function getCashAccountInterestRate(
  accountId: string,
  accessToken: string
) {
  const data = {
    operationName: "FetchAccountInterestRate",
    variables: {
      accountId: accountId
    },
    query:
      "query FetchAccountInterestRate($accountId: ID!) {\n  account(id: $accountId) {\n    ...AccountInterestRate\n    __typename\n  }\n}\n\nfragment AccountInterestRate on Account {\n  id\n  interestRate: interest_rate\n  interestRateBoosted\n  __typename\n}"
  }

  const res = await fetch(WS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Ws-Api-Version": "12",
      "X-Ws-Profile": "invest",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  return json.data.account
}

export async function getDividendActivities(accessToken: string) {
  const now: string = new Date().toISOString()
  const data = {
    operationName: "FetchAccountInterestRate",
    variables: {
      types: ["DIVIDEND", "INTEREST", "STOCK_DIVIDEND"],
      first: 50,
      endDate: now
    },
    query:
      "query FetchAccountInterestRate($accountId: ID!) {\n  account(id: $accountId) {\n    ...AccountInterestRate\n    __typename\n  }\n}\n\nfragment AccountInterestRate on Account {\n  id\n  interestRate: interest_rate\n  interestRateBoosted\n  __typename\n}"
  }

  const res = await fetch(WS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Ws-Api-Version": "12",
      "X-Ws-Profile": "invest",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  return json
}

export async function getAllAccountFiniancials(
  accessToken: string,
  identityId: string
) {
  const data = {
    operationName: "FetchAllAccountFinancials",
    variables: {
      pageSize: 25,
      identityId: identityId
    },
    query:
      "query FetchAllAccountFinancials($identityId: ID!, $startDate: Date, $pageSize: Int = 25, $cursor: String) {\n  identity(id: $identityId) {\n    id\n    ...AllAccountFinancials\n    __typename\n  }\n}\n\nfragment AllAccountFinancials on Identity {\n  accounts(filter: {}, first: $pageSize, after: $cursor) {\n    pageInfo {\n      hasNextPage\n      endCursor\n      __typename\n    }\n    edges {\n      cursor\n      node {\n        ...AccountWithFinancials\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment AccountWithFinancials on Account {\n  ...AccountWithLink\n  ...AccountFinancials\n  __typename\n}\n\nfragment AccountWithLink on Account {\n  ...Account\n  linkedAccount {\n    ...Account\n    __typename\n  }\n  __typename\n}\n\nfragment Account on Account {\n  ...AccountCore\n  custodianAccounts {\n    ...CustodianAccount\n    __typename\n  }\n  __typename\n}\n\nfragment AccountCore on Account {\n  id\n  archivedAt\n  branch\n  closedAt\n  createdAt\n  cacheExpiredAt\n  currency\n  requiredIdentityVerification\n  unifiedAccountType\n  supportedCurrencies\n  nickname\n  status\n  accountOwnerConfiguration\n  accountFeatures {\n    ...AccountFeature\n    __typename\n  }\n  accountOwners {\n    ...AccountOwner\n    __typename\n  }\n  type\n  __typename\n}\n\nfragment AccountFeature on AccountFeature {\n  name\n  enabled\n  __typename\n}\n\nfragment AccountOwner on AccountOwner {\n  accountId\n  identityId\n  accountNickname\n  clientCanonicalId\n  accountOpeningAgreementsSigned\n  name\n  email\n  ownershipType\n  activeInvitation {\n    ...AccountOwnerInvitation\n    __typename\n  }\n  sentInvitations {\n    ...AccountOwnerInvitation\n    __typename\n  }\n  __typename\n}\n\nfragment AccountOwnerInvitation on AccountOwnerInvitation {\n  id\n  createdAt\n  inviteeName\n  inviteeEmail\n  inviterName\n  inviterEmail\n  updatedAt\n  sentAt\n  status\n  __typename\n}\n\nfragment CustodianAccount on CustodianAccount {\n  id\n  branch\n  custodian\n  status\n  updatedAt\n  __typename\n}\n\nfragment AccountFinancials on Account {\n  id\n  custodianAccounts {\n    id\n    financials {\n      current {\n        ...CustodianAccountCurrentFinancialValues\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  financials {\n    currentCombined {\n      ...AccountCurrentFinancials\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment CustodianAccountCurrentFinancialValues on CustodianAccountCurrentFinancialValues {\n  deposits {\n    ...Money\n    __typename\n  }\n  earnings {\n    ...Money\n    __typename\n  }\n  netDeposits {\n    ...Money\n    __typename\n  }\n  netLiquidationValue {\n    ...Money\n    __typename\n  }\n  withdrawals {\n    ...Money\n    __typename\n  }\n  __typename\n}\n\nfragment Money on Money {\n  amount\n  cents\n  currency\n  __typename\n}\n\nfragment AccountCurrentFinancials on AccountCurrentFinancials {\n  netLiquidationValue {\n    ...Money\n    __typename\n  }\n  netDeposits {\n    ...Money\n    __typename\n  }\n  simpleReturns(referenceDate: $startDate) {\n    ...SimpleReturns\n    __typename\n  }\n  totalDeposits {\n    ...Money\n    __typename\n  }\n  totalWithdrawals {\n    ...Money\n    __typename\n  }\n  __typename\n}\n\nfragment SimpleReturns on SimpleReturns {\n  amount {\n    ...Money\n    __typename\n  }\n  asOf\n  rate\n  referenceDate\n  __typename\n}"
  }

  const res = await fetch(WS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Ws-Api-Version": "12",
      "X-Ws-Profile": "trade",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  return json
}

function buildFeedItemQL(accountIds: string[], cursor?: string) {
  return {
    operationName: "FetchActivityFeedItems",
    variables: {
      orderBy: "OCCURRED_AT_DESC",
      condition: {
        accountIds: accountIds,
        types: ["DIVIDEND", "STOCK_DIVIDEND", "INTEREST"],
        endDate: generateTimestampNow()
      },
      first: 100,
      cursor: cursor
    },
    query:
      "query FetchActivityFeedItems($first: Int, $cursor: Cursor, $condition: ActivityCondition, $orderBy: [ActivitiesOrderBy!] = OCCURRED_AT_DESC) {\n  activityFeedItems(\n    first: $first\n    after: $cursor\n    condition: $condition\n    orderBy: $orderBy\n  ) {\n    edges {\n      node {\n        ...Activity\n        __typename\n      }\n      __typename\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment Activity on ActivityFeedItem {\n  accountId\n  aftOriginatorName\n  aftTransactionCategory\n  aftTransactionType\n  amount\n  amountSign\n  assetQuantity\n  assetSymbol\n  canonicalId\n  currency\n  eTransferEmail\n  eTransferName\n  externalCanonicalId\n  identityId\n  institutionName\n  occurredAt\n  p2pHandle\n  p2pMessage\n  spendMerchant\n  securityId\n  billPayCompanyName\n  billPayPayeeNickname\n  redactedExternalAccountNumber\n  opposingAccountId\n  status\n  subType\n  type\n  strikePrice\n  contractType\n  expiryDate\n  chequeNumber\n  provisionalCreditAmount\n  primaryBlocker\n  interestRate\n  frequency\n  counterAssetSymbol\n  rewardProgram\n  counterPartyCurrency\n  counterPartyCurrencyAmount\n  counterPartyName\n  fxRate\n  fees\n  reference\n  __typename\n}"
  }
}

export async function getAllDivItems(
  accessToken: string,
  accountIds: Array<{
    accountId: string
    type: string
    unifiedAccountType: string
  }>,
  lastFeedItem?: FeedItem
): Promise<Array<FeedItem>> {
  const allAccIds = accountIds.map((acc) => acc.accountId)

  const divQLBody = buildFeedItemQL(allAccIds)

  const res = await fetch(WS_GRAPHQL_URL, {
    method: "POST",
    body: JSON.stringify(divQLBody),
    headers: {
      "content-type": "application/json",
      "X-Ws-Api-Version": "12",
      "X-Ws-Profile": "trade",
      Authorization: `Bearer ${accessToken}`
    }
  })

  const json = await res.json()
  const formattedData = formatFeedItemResp(json)
  if (!formattedData) return null

  let nextCursor = json.data.activityFeedItems.pageInfo.endCursor

  if (lastFeedItem) {
    const feedInData = formattedData.find((item) => {
      return (
        item.canonicalId.includes(lastFeedItem.canonicalId) &&
        item.accountId === lastFeedItem.accountId
      )
    })

    if (feedInData) {
      const feedInDataIndex = formattedData.indexOf(feedInData)
      formattedData.splice(
        feedInDataIndex,
        formattedData.length - feedInDataIndex
      )
      nextCursor = null
    }
  }

  while (nextCursor) {
    const newQLBody = buildFeedItemQL(allAccIds, nextCursor)
    const newRes = await fetch(WS_GRAPHQL_URL, {
      method: "POST",
      body: JSON.stringify(newQLBody),
      headers: {
        "content-type": "application/json",
        "X-Ws-Api-Version": "12",
        "X-Ws-Profile": "trade",
        Authorization: `Bearer ${accessToken}`
      }
    })

    const newJson = await newRes.json()
    const newFormattedData = formatFeedItemResp(newJson)
    if (!newFormattedData) break

    formattedData.push(...newFormattedData)

    nextCursor = newJson?.data?.activityFeedItems?.pageInfo?.endCursor

    if (lastFeedItem) {
      const feedInData = formattedData.find((item) => {
        return (
          item.canonicalId.includes(lastFeedItem.canonicalId) &&
          item.accountId === lastFeedItem.accountId
        )
      })

      if (feedInData) {
        const feedInDataIndex = formattedData.indexOf(feedInData)
        formattedData.splice(
          feedInDataIndex,
          formattedData.length - feedInDataIndex
        )
        nextCursor = null
      }
    }
  }

  const formattedFeedItemWithUnifiedAccType = formattedData.map((item) => {
    return {
      ...item,
      unifiedAccountType: accountIds.find(
        (acc) => acc.accountId === item.accountId
      )?.unifiedAccountType
    }
  })

  return formattedFeedItemWithUnifiedAccType
}

export async function getManagedAccountPositions(
  token: string,
  accountId: string
) {
  const data = {
    operationName: "FetchAccountManagedPortfolioPositions",
    variables: {
      accountId: accountId
    },
    query:
      "query FetchAccountManagedPortfolioPositions($accountId: ID!) {\n  account(id: $accountId) {\n    id\n    positions {\n      ...ManagedPortfolioPosition\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ManagedPortfolioPosition on Position {\n  id\n  allocation\n  className: class_name\n  currency\n  description\n  fee\n  name\n  performance\n  symbol\n  type\n  value\n  category\n  quantity\n  __typename\n}"
  }

  const res = await fetch(WS_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Ws-Api-Version": "12",
      "X-Ws-Profile": "invest",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  if (res.ok) {
    const json = await res.json()

    return json?.data?.account?.positions
  }
}
