import type { FeedItem } from "~types"

import { generateTimestampNow, isInCurrentYear } from "./shared"
import { formatFeedItemResp } from "./wealthsimple"

export async function getCashIdentity(clientId: string, token: string) {
  try {
    const data = {
      operationName: "clientSessionsQuery",
      variables: {
        clientId: clientId
      },
      query:
        "query clientSessionsQuery($clientId: ID!) {\n  client(id: $clientId) {\n    id\n    profile {\n      preferred_first_name\n      full_legal_name {\n        first_name\n        last_name\n        __typename\n      }\n      date_of_birth\n      identity_id\n      __typename\n    }\n    tier\n    jurisdiction\n    sri_interested\n    created_at\n    onboarding {\n      flow\n      states {\n        complete\n        risk_score\n        kyc_application\n        email_confirmation\n        signatures\n        e_signatures\n        debit_account\n        __typename\n      }\n      selected_product\n      funded\n      __typename\n    }\n    two_factor {\n      device_type\n      __typename\n    }\n    session {\n      id\n      email\n      unconfirmed_email\n      email_confirmed\n      email_updates\n      pending_co_owner_onboarding\n      phone\n      roles\n      feature_flags\n      block_user_due_to_risk_survey\n      skips_risk_survey\n      recovery_code\n      search {\n        api_key\n        indices\n        application_id\n        roles\n        feature_flags\n        __typename\n      }\n      impersonated\n      churned\n      is_advisor\n      is_employer\n      is_advised\n      is_halal\n      requires_pep_review\n      has_account\n      has_draft_transfers\n      call_required\n      digital_suitability\n      locale\n      theme\n      earn_rewards_hidden\n      global_notifications {\n        type\n        details\n        dismissed\n        dismissable\n        priority\n        __typename\n      }\n      trading_attributes {\n        tax_loss_harvest\n        __typename\n      }\n      reassessment_required\n      force_reassessment\n      reassessment_in_progress\n      __typename\n    }\n    __typename\n  }\n}\n"
    }

    const res = await fetch("https://my.wealthsimple.com/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-Ws-Api-Version": "12",
        "X-Ws-Profile": "invest",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const json = await res.json()

    return json.data.client
  } catch (error) {
    console.error(error)
  }

  return null
}

export function getYearlyTotal(balance: number, interestRate: number) {
  return balance * interestRate
}

export async function getCashAccountIdentity(
  idenitityId: string,
  token: string
) {
  const data = {
    operationName: "FetchAllAccounts",
    variables: {
      pageSize: 25,
      filter: {
        closed: false,
        archived: false,
        types: ["CASH"]
      },
      identityId: idenitityId
    },
    query:
      "query FetchAllAccounts($identityId: ID!, $pageSize: Int = 25, $cursor: String, $filter: AccountsFilter = {archived: false}) {\n  identity(id: $identityId) {\n    id\n    accounts(first: $pageSize, after: $cursor, filter: $filter) {\n      pageInfo {\n        hasNextPage\n        endCursor\n        __typename\n      }\n      edges {\n        node {\n          ...AccountWithLink\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment AccountWithLink on Account {\n  ...Account\n  linkedAccount {\n    ...Account\n    __typename\n  }\n  __typename\n}\n\nfragment Account on Account {\n  ...AccountCore\n  custodianAccounts {\n    ...CustodianAccount\n    __typename\n  }\n  __typename\n}\n\nfragment AccountCore on Account {\n  id\n  applicationFamilyId\n  archivedAt\n  branch\n  category\n  closedAt\n  createdAt\n  currency\n  requiredIdentityVerification\n  unifiedAccountType\n  updatedAt\n  nickname\n  status\n  accountOwnerConfiguration\n  accountFeatures {\n    ...AccountFeature\n    __typename\n  }\n  accountOwners {\n    ...AccountOwner\n    __typename\n  }\n  type\n  __typename\n}\n\nfragment AccountFeature on AccountFeature {\n  name\n  enabled\n  __typename\n}\n\nfragment AccountOwner on AccountOwner {\n  accountId\n  identityId\n  accountNickname\n  clientCanonicalId\n  accountOpeningAgreementsSigned\n  name\n  email\n  ownershipType\n  activeInvitation {\n    ...AccountOwnerInvitation\n    __typename\n  }\n  __typename\n}\n\nfragment AccountOwnerInvitation on AccountOwnerInvitation {\n  id\n  createdAt\n  inviteeName\n  inviteeEmail\n  inviterName\n  inviterEmail\n  updatedAt\n  status\n  __typename\n}\n\nfragment CustodianAccount on CustodianAccount {\n  id\n  branch\n  countryCode\n  createdAt\n  currency\n  custodian\n  status\n  updatedAt\n  __typename\n}\n"
  }

  const res = await fetch("https://my.wealthsimple.com/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Ws-Api-Version": "12",
      "X-Ws-Profile": "invest",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })

  const json = await res.json()

  return json.data.identity
}

export async function getCashAccountBalance(
  accountId: string,
  accessToken: string
) {
  const data = {
    operationName: "FetchCashAccount",
    variables: {
      accountId: accountId
    },
    query:
      "query FetchCashAccount($accountId: ID!) {\n  cashAccount(id: $accountId) {\n    ...CashAccount\n    __typename\n  }\n}\n\nfragment CashAccount on CashAccount {\n  id\n  spendingBalance\n  pendingBalance\n  withdrawalBalance\n  __typename\n}\n"
  }

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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

  return json.data.cashAccount
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

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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

export async function getCashPastInterests(
  accessToken: string,
  accountId: string
) {
  const now: string = new Date().toISOString()
  const data = {
    operationName: "FetchActivityFeedItems",
    variables: {
      orderBy: "OCCURRED_AT_DESC",
      condition: {
        accountIds: [accountId],
        types: ["INTEREST"],
        endDate: now
      },
      first: 50
    },
    query:
      "query FetchActivityFeedItems($first: Int, $cursor: Cursor, $condition: ActivityCondition, $orderBy: [ActivitiesOrderBy!] = OCCURRED_AT_DESC) {\n  activityFeedItems(\n    first: $first\n    after: $cursor\n    condition: $condition\n    orderBy: $orderBy\n  ) {\n    edges {\n      node {\n        ...Activity\n        __typename\n      }\n      __typename\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment Activity on ActivityFeedItem {\n  accountId\n  aftOriginatorName\n  aftTransactionCategory\n  aftTransactionType\n  amount\n  amountSign\n  assetQuantity\n  assetSymbol\n  canonicalId\n  currency\n  eTransferEmail\n  eTransferName\n  externalCanonicalId\n  identityId\n  institutionName\n  occurredAt\n  p2pHandle\n  p2pMessage\n  spendMerchant\n  securityId\n  billPayCompanyName\n  billPayPayeeNickname\n  redactedExternalAccountNumber\n  opposingAccountId\n  status\n  subType\n  type\n  strikePrice\n  contractType\n  expiryDate\n  chequeNumber\n  provisionalCreditAmount\n  primaryBlocker\n  interestRate\n  frequency\n  counterAssetSymbol\n  rewardProgram\n  counterPartyCurrency\n  counterPartyCurrencyAmount\n  counterPartyName\n  fxRate\n  fees\n  reference\n  __typename\n}"
  }

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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

export async function getYearToDateDivItems(
  accessToken: string,
  accountIds: Array<{
    accountId: string
    type: string
    unifiedAccountType: string
  }>
): Promise<Array<FeedItem>> {
  const allAccIds = accountIds.map((acc) => acc.accountId)

  const divQLBody = buildFeedItemQL(allAccIds)

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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

  const lastDivItem = formattedData[formattedData.length - 1]
  const lastDivDate = lastDivItem.occurredAt

  let isCurrentYear = isInCurrentYear(lastDivDate)
  while (isCurrentYear) {
    const cursor = json.data.activityFeedItems.pageInfo.endCursor
    const newQLBody = buildFeedItemQL(allAccIds, cursor)
    const newRes = await fetch("https://my.wealthsimple.com/graphql", {
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

    const newLastDivItem = newFormattedData[newFormattedData.length - 1]
    const newLastDivDate = newLastDivItem.occurredAt

    isCurrentYear = isInCurrentYear(newLastDivDate)
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

  const res = await fetch("https://my.wealthsimple.com/graphql", {
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
    const newRes = await fetch("https://my.wealthsimple.com/graphql", {
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
