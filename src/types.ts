export interface Balance {
  amount: string
  currency: string
  cents: number
  __typename: string // You may want to replace this with a more specific type if possible
}

export interface InterestRate {
  id: string
  interestRate: string
  interestRateBoosted: boolean
  __typename: string // You may want to replace this with a more specific type if possible
}

export interface CashAccount {
  balance: Balance
  interestRate: InterestRate
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
  amount: number
  currency: string
  occurredAt: string
  type: string
  unifiedAccountType: string
  assetSymbol: string
  canonicalId: string
  securityId: string
}

export interface Account {
  id: string
  currency: string
  nickname: string
  status: string
  type: string
  financials: any // Adjust type if you have more specific financials structure
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
