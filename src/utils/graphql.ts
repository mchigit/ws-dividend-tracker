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
