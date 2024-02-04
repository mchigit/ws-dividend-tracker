export interface Balance {
  id: string
  spendingBalance: number
  pendingBalance: number
  withdrawalBalance: number
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
}
