import type { Account, FeedItem } from "~types"

export class WealthSimpleClient {
  private accessToken: string
  private baseUrl: string
  private tradeUserId: string
  private investUserId: string
  private identityId: string

  constructor(cookeValue: string) {
    const parsedCookie = JSON.parse(decodeURIComponent(cookeValue))
    this.accessToken = parsedCookie.access_token
    this.tradeUserId = parsedCookie.profiles.trade.default
    this.investUserId = parsedCookie.profiles.invest.default
    this.identityId = parsedCookie.identity_canonical_id
    this.baseUrl = "https://my.wealthsimple.com/graphql"
  }

  _formatFiniancialData(data: any): Array<{
    id: string
    category: string
    createdAt: string
    currency: string
    unifiedAccountType: string
    type: string
  }> {
    const allAccounts = data?.data?.identity?.accounts?.edges
    if (allAccounts && allAccounts.length > 0) {
      const formattedAccounts = allAccounts.map((account: any) => {
        if (account?.node?.id) {
          const id = account.node.id as string
          const category = account?.node?.category as string
          const createdAt = account?.node?.createdAt as string
          const currency = account?.node?.currency as string
          const unifiedAccountType = account?.node?.unifiedAccountType as string
          const type = account?.node?.type as string

          return {
            id,
            category,
            createdAt,
            currency,
            unifiedAccountType,
            type
          }
        }

        return null
      })

      return formattedAccounts.filter((account: any) => !!account)
    }

    return null
  }

  async getAllAccountFiniancials() {
    const data = {
      operationName: "FetchAllAccountFinancials",
      variables: {
        startDate: "1970-01-01",
        pageSize: 25,
        withNewAccountFinancials: false,
        withoutFinancials: false,
        identityId: this.identityId
      },
      query:
        'query FetchAllAccountFinancials($identityId: ID!, $startDate: Date! = "1970-01-01", $pageSize: Int = 25, $cursor: String, $withNewAccountFinancials: Boolean!, $withoutFinancials: Boolean!) {\n  identity(id: $identityId) {\n    id\n    ...AllAccountFinancials\n    __typename\n  }\n}\n\nfragment AllAccountFinancials on Identity {\n  accounts(filter: {}, first: $pageSize, after: $cursor) {\n    pageInfo {\n      hasNextPage\n      endCursor\n      __typename\n    }\n    edges {\n      cursor\n      node {\n        ...AccountWithFinancials\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment AccountWithFinancials on Account {\n  ...AccountWithLink\n  ...AccountFinancials @skip(if: $withoutFinancials)\n  __typename\n}\n\nfragment AccountWithLink on Account {\n  ...Account\n  linkedAccount {\n    ...Account\n    __typename\n  }\n  __typename\n}\n\nfragment Account on Account {\n  ...AccountCore\n  custodianAccounts {\n    ...CustodianAccount\n    __typename\n  }\n  __typename\n}\n\nfragment AccountCore on Account {\n  id\n  applicationFamilyId\n  archivedAt\n  branch\n  category\n  closedAt\n  createdAt\n  currency\n  requiredIdentityVerification\n  unifiedAccountType\n  updatedAt\n  nickname\n  status\n  accountOwnerConfiguration\n  accountFeatures {\n    ...AccountFeature\n    __typename\n  }\n  accountOwners {\n    ...AccountOwner\n    __typename\n  }\n  type\n  __typename\n}\n\nfragment AccountFeature on AccountFeature {\n  name\n  enabled\n  __typename\n}\n\nfragment AccountOwner on AccountOwner {\n  accountId\n  identityId\n  accountNickname\n  clientCanonicalId\n  accountOpeningAgreementsSigned\n  name\n  email\n  ownershipType\n  activeInvitation {\n    ...AccountOwnerInvitation\n    __typename\n  }\n  sentInvitations {\n    ...AccountOwnerInvitation\n    __typename\n  }\n  __typename\n}\n\nfragment AccountOwnerInvitation on AccountOwnerInvitation {\n  id\n  createdAt\n  inviteeName\n  inviteeEmail\n  inviterName\n  inviterEmail\n  updatedAt\n  status\n  __typename\n}\n\nfragment CustodianAccount on CustodianAccount {\n  id\n  branch\n  countryCode\n  createdAt\n  currency\n  custodian\n  status\n  updatedAt\n  __typename\n}\n\nfragment AccountFinancials on Account {\n  id\n  custodianAccounts {\n    id\n    financials {\n      current {\n        ...CustodianAccountCurrentFinancialValues\n        __typename\n      }\n      ... on CustodianAccountFinancialsSo {\n        tradingBalance: balance(type: TRADING) {\n          quantity\n          securityId\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  financials {\n    currentCombined @include(if: $withNewAccountFinancials) {\n      ...AccountCurrentFinancials\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment CustodianAccountCurrentFinancialValues on CustodianAccountCurrentFinancialValues {\n  deposits {\n    ...Money\n    __typename\n  }\n  earnings {\n    ...Money\n    __typename\n  }\n  netDeposits {\n    ...Money\n    __typename\n  }\n  netLiquidationValue {\n    ...Money\n    __typename\n  }\n  withdrawals {\n    ...Money\n    __typename\n  }\n  __typename\n}\n\nfragment Money on Money {\n  amount\n  cents\n  currency\n  __typename\n}\n\nfragment AccountCurrentFinancials on AccountCurrentFinancials {\n  netLiquidationValue {\n    ...Money\n    __typename\n  }\n  netDeposits {\n    ...Money\n    __typename\n  }\n  simpleReturns(referenceDate: $startDate) {\n    ...SimpleReturns\n    __typename\n  }\n  totalDeposits {\n    ...Money\n    __typename\n  }\n  totalWithdrawals {\n    ...Money\n    __typename\n  }\n  __typename\n}\n\nfragment SimpleReturns on SimpleReturns {\n  amount {\n    ...Money\n    __typename\n  }\n  asOf\n  rate\n  referenceDate\n  __typename\n}'
    }

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Ws-Api-Version": "12",
        "X-Ws-Profile": "invest",
        Authorization: `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(data)
    })

    const json = await res.json()

    return this._formatFiniancialData(json)
  }

  async getManagedAccountPositions(accountId: string) {
    const data = {
      operationName: "FetchAccountManagedPortfolioPositions",
      variables: {
        accountId: accountId
      },
      query:
        "query FetchAccountManagedPortfolioPositions($accountId: ID!) {\n  account(id: $accountId) {\n    id\n    positions {\n      ...ManagedPortfolioPosition\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment ManagedPortfolioPosition on Position {\n  id\n  allocation\n  className: class_name\n  currency\n  description\n  fee\n  name\n  performance\n  symbol\n  type\n  value\n  category\n  quantity\n  __typename\n}"
    }

    const res = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Ws-Api-Version": "12",
        "X-Ws-Profile": "invest",
        Authorization: `Bearer ${this.accessToken}`
      },
      body: JSON.stringify(data)
    })

    if (res.ok) {
      const json = await res.json()

      return json?.data?.account?.positions
    }
  }
}

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

// export function categFeedByAccType(feedItems: FeedItem[]) {
//   const cashItems = feedItems.filter((item) =>
//     item.type.toLowerCase().includes("cash")
//   )

//   const tradeItems = feedItems.filter((item) =>
//     item.type.toLowerCase().includes("trade")
//   )

//   return {
//     cashItems,
//     tradeIrechatems
//   }
// }
