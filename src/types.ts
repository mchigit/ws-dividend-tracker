export interface Balance {
  amount: string
  currency: string
  cents: number
  __typename: string
}

export interface InterestRate {
  id: string
  interestRate: string
  interestRateBoosted: boolean
  __typename: string
}

export interface CashAccount {
  balance: Balance
  interestRate: InterestRate
  accInfo: any
}

export type Stock = {
  symbol: string
  name: string
  primary_exchange: string
}

export type Position = {
  currency: string
  stock: Stock
  quantity: number
  account_id: string
  type?: string
  sec_id: string
}

export type ManagedPosition = {
  id: string
  allocation: string
  className: string
  currency: string
  description: string
  fee: string
  name: string
  performance: string
  symbol: string
  type: string
  value: string
  category: string
  quantity: string
  __typename: string
}

export type CashAccountInterest = {
  amount: string
  occurredAt: string
  currency: string
}

export interface FeedItem {
  accountId: string
  aftOriginatorName: string | null
  aftTransactionCategory: string | null
  aftTransactionType: string | null
  amount: string
  amountSign: "positive" | "negative"
  assetQuantity: string | null
  assetSymbol: string | null
  canonicalId: string
  currency: string
  eTransferEmail: string | null
  eTransferName: string | null
  externalCanonicalId: string
  identityId: string
  institutionName: string | null
  occurredAt: string
  p2pHandle: string | null
  p2pMessage: string | null
  spendMerchant: string | null
  securityId: string | null
  billPayCompanyName: string | null
  billPayPayeeNickname: string | null
  redactedExternalAccountNumber: string | null
  opposingAccountId: string | null
  status: string
  subType: string
  type: string
  strikePrice: string | null
  contractType: string | null
  expiryDate: string | null
  chequeNumber: string | null
  provisionalCreditAmount: string | null
  primaryBlocker: string | null
  interestRate: string | null
  frequency: string | null
  counterAssetSymbol: string | null
  rewardProgram: string | null
  counterPartyCurrency: string | null
  counterPartyCurrencyAmount: string | null
  counterPartyName: string | null
  fxRate: string | null
  fees: string | null
  reference: string | null
  __typename: string
}

export interface Account {
  id: string
  currency: string
  nickname: string
  status: string
  type: string
  financials: any
  unifiedAccountType: string
}

export type FilterValues = {
  uniqueAccs: Array<{
    id: string
    type: string
    unifiedAccountType: string
  }>
  symbols: string[]
}

export interface CashAccounts {
  cashAccounts: CashAccount[]
}
