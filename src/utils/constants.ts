export const STOCK_API_URL = "https://stock-api.up.railway.app"

export const ACTIVITY_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  { label: "Bonus", value: "Bonus" },
  { label: "Buys", value: "Buys" },
  { label: "Cash sent and received", value: "Cash sent and received" },
  { label: "Deposits", value: "Deposits" },
  { label: "Dividends", value: "Dividends" },
  { label: "Interest", value: "Interest" },
  { label: "Fees", value: "Fees" },
  { label: "Sells", value: "Sells" },
  { label: "Purchases", value: "Purchases" },
  { label: "Refunds and reimbursements", value: "Refunds and reimbursements" },
  { label: "Transfers", value: "Transfers" },
  { label: "Withdrawals", value: "Withdrawals" }
  // { label: "Write-offs", value: "Write-offs" }
]

export const TYPE_TO_QUERY_TYPE_MAP: Record<string, string[]> = {
  Bonus: ["AFFILIATE", "PROMOTION", "REFERRAL"],
  Buys: ["MANAGED_BUY", "CRYPTO_BUY", "DIY_BUY", "OPTIONS_BUY"],
  "Cash sent and received": ["P2P_PAYMENT"],
  Deposits: ["DEPOSIT", "GROUP_CONTRIBUTION"],
  Dividends: ["DIVIDEND", "STOCK_DIVIDEND"],
  Interest: ["INTEREST"],
  Fees: ["FEE"],
  Sells: ["MANAGED_SELL", "CRYPTO_SELL", "DIY_SELL", "OPTIONS_SELL"],
  Purchases: ["SPEND", "PREPAID_SPEND", "CREDIT_CARD"],
  "Refunds and reimbursements": ["REFUND", "REIMBURSEMENT"],
  Transfers: [
    "INTERNAL_TRANSFER",
    "INSTITUTIONAL_TRANSFER_INTENT",
    "LEGACY_INTERNAL_TRANSFER",
    "LEGACY_TRANSFER",
    "CRYPTO_TRANSFER",
    "ASSET_MOVEMENT"
  ],
  Withdrawals: ["WITHDRAWAL"]
}

export const ACTIVITY_TIMEFRAME_PRESETS = [
  { label: "All", value: "all" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 60 days", value: "60d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Custom Range", value: "custom" }
]
