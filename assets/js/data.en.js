// Static data for payout conversion methods, prop firms, and affiliate links
// (English). Fee/markup figures are estimates for comparison purposes —
// always verify live rates directly with each provider before withdrawing.
// Keep this in sync with assets/js/data.js (the Russian version) whenever
// the underlying numbers (markupPercent, fixedFee, slugs, ids) change.

const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "JPY", "PLN", "CZK", "HUF", "RON", "BGN", "TRY", "INR", "ZAR", "MXN", "BRL", "NGN", "SEK", "NOK", "DKK", "RUB", "KZT", "UAH"];

const METHODS = [
  {
    id: "wise",
    name: "Wise",
    markupPercent: 0.6,
    fixedFee: 0,
    speed: "1-2 days",
    speedRank: 2,
    description: "Mid-market rate plus a small transparent markup. No hidden fixed fee on most corridors.",
  },
  {
    id: "revolut",
    name: "Revolut",
    markupPercent: 0.5,
    fixedFee: 0,
    speed: "Instant - 1 day",
    speedRank: 1,
    description: "Free-plan fair-usage limits apply; a fee (often ~1%) can kick in on weekends or above your monthly allowance.",
  },
  {
    id: "bank",
    name: "Bank transfer (SWIFT)",
    markupPercent: 3,
    fixedFee: 25,
    speed: "3-7 days",
    speedRank: 4,
    description: "Your bank's own FX rate is typically well below mid-market, plus a flat wire fee.",
  },
  {
    id: "crypto",
    name: "Crypto (USDT) + local exchange",
    markupPercent: 1,
    fixedFee: 2,
    speed: "Minutes - hours",
    speedRank: 0,
    description: "Fast, but you're exposed to network fees and the spread when you cash out USDT to your local currency.",
  },
];

const AFFILIATE_LINKS = {
  wise: { url: null, label: "Open a Wise account" },
  revolut: { url: null, label: "Open a Revolut account" },
  bank: { url: null, label: null },
  crypto: { url: null, label: null },
};

// Prop-firm specific payout data, collected via web research.
// IMPORTANT: verify every figure directly on the firm's own site before
// publishing that firm's page — these can be out of date or inaccurate.
const FIRMS = [
  {
    slug: "ftmo",
    name: "FTMO",
    methods: [
      "Bank transfer",
      "Visa Direct / Mastercard Send (up to $20K)",
      "Skrill (up to $3K)",
      "Crypto",
    ],
    fee: "No firm-side fee; your bank may charge its own fee",
    minWithdrawal: "$20 (bank) / $50 (crypto)",
    speed: "1-2 days",
    notes: "Bank transfer is unavailable for traders in Venezuela, Cuba, Sudan, and Ukraine.",
    payoutCurrency: "USD",
  },
  {
    slug: "fundednext",
    name: "FundedNext",
    methods: ["USDT/USDC (crypto)", "RiseWorks", "Bank transfer", "Confirmo"],
    fee: "Up to 3% (paid by the trader)",
    minWithdrawal: "Not specified — verify before relying on this",
    speed: "24h (crypto/RiseWorks), up to 5 days (bank)",
    notes: "RiseWorks is only available in select regions; traders in Iran can only use TC Pay.",
    payoutCurrency: "USD",
  },
  {
    slug: "the5ers",
    name: "The5ers",
    methods: ["RiseWorks", "Crypto", "Bank transfer", "Hub Credits"],
    fee: "Bank 3%, crypto/RiseWorks 2% (some sources cite a flat 3.5%) — verify before relying on this",
    minWithdrawal: "$150",
    speed: "~72 hours, on a biweekly payout cycle",
    notes: "Crypto withdrawals are capped at $1,500 per request.",
    payoutCurrency: "USD",
  },
  {
    slug: "e8-markets",
    name: "E8 Markets",
    methods: ["RiseWorks", "WorkMarket"],
    fee: "No firm-side fee",
    minWithdrawal: "$100",
    speed: "Not specified — verify before relying on this",
    notes: "",
    payoutCurrency: "USD",
  },
];
