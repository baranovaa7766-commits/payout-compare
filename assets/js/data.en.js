// Static data for crypto payout routes, prop firms, and affiliate links
// (English). Fee/spread figures are estimates for comparison purposes —
// always verify live rates directly with each provider before withdrawing.
// Keep this in sync with assets/js/data.js (the Russian version) whenever
// the underlying numbers (spreadPercent, fixedFee, ids, slugs) change.
//
// v2: the site compares exchange + off-ramp combos (buy USDT, then convert
// USDT to local currency) instead of Wise/Revolut/bank, because Wise and
// Revolut don't work for users in Russia. Bank transfer is kept as a
// contrasting worst-case baseline. See
// payout-comparison-site-spec-v2-crypto-pivot.md.

const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "JPY", "PLN", "CZK", "HUF", "RON", "BGN", "TRY", "INR", "ZAR", "MXN", "BRL", "NGN", "SEK", "NOK", "DKK", "RUB", "KZT", "UAH", "BYN"];

// Crypto exchanges — stage 1 (buying/receiving USDT). Affiliate programs
// are confirmed for all four.
const EXCHANGES = [
  {
    id: "bybit",
    name: "Bybit",
    spreadPercent: 0.3,
    fixedFee: 1,
    speed: "minutes",
    affiliateConfirmed: true,
    notes: "Affiliate program confirmed (affiliates.bybit.com); no mandatory ID verification just to join the affiliate program.",
  },
  {
    id: "bitget",
    name: "Bitget",
    spreadPercent: 0.3,
    fixedFee: 1,
    speed: "minutes",
    affiliateConfirmed: true,
    notes: "Relatively low barrier to join the affiliate program.",
  },
  {
    id: "kucoin",
    name: "KuCoin",
    spreadPercent: 0.3,
    fixedFee: 1,
    speed: "minutes",
    affiliateConfirmed: true,
    notes: "Open affiliate program, 30-50% of trading fees for life.",
  },
  {
    id: "whitebit",
    name: "WhiteBIT",
    spreadPercent: 0.4,
    fixedFee: 1,
    speed: "minutes",
    affiliateConfirmed: true,
    notes: "Affiliate program confirmed (whitebit.com/referral).",
  },
];

// Off-ramp services — stage 2 (USDT to local currency).
//
// Affiliate/referral programs (sign-up-via-link) are NOT what `dataVerified`
// tracks. `dataVerified: true` only means the spread/fixedFee below came
// from the provider's own published fee page (not a guess) as of the date
// noted. Fees change without notice and neither provider exposes a public
// API for them — there's no live auto-refresh for these the way there is
// for the exchange rate in rates.js (which refetches on every calculation).
// Re-check the linked pages every few months and update the numbers.
//
// A7A5 is deliberately excluded: it isn't a standalone off-ramp but a
// ruble-backed stablecoin from A7/Old Vector LLC, traded mainly on the
// Grinex exchange — and Grinex, along with entities tied to A7A5, was
// sanctioned by the US Treasury's OFAC in August 2025 as a successor to the
// already-sanctioned Garantex exchange. Don't re-add without re-checking
// sanctions status.
const OFFRAMPS = [
  {
    id: "whitebird",
    // Source: https://whitebird.io/commission (checked 2026-09-03).
    // "Other payment methods" -> "Russian bank cards", "client sells"
    // column: 2.0%. That's the most universally applicable RUB card
    // withdrawal option; VTB Pay is cheaper (1.7%) but only for VTB
    // cardholders. No separate flat/network fee is listed on top of it.
    name: "Whitebird",
    spreadPercent: 2.0,
    fixedFee: 0,
    speed: "10-30 minutes",
    dataVerified: true,
    notes: "Licensed platform (Belarus): converts USDT/BTC/ETH to RUB/BYN onto a Mir card. 2.0% is the rate for withdrawing to a Russian bank card, whitebird.io/commission.",
  },
  {
    id: "cifra",
    // Source: https://cifra.by/rates (checked 2026-09-03).
    // 1.5% is the crypto-to-fiat (USDT/RUB) conversion fee on the entry-
    // level "Consulting" plan. On top of that, non-Belarus residents pay a
    // flat RUB withdrawal fee of 500 RUB (0 if withdrawing into a Cifra
    // Bank account). Converted to ~$6 at ~85 RUB/USD for consistency with
    // the other fixedFee values (the original fee is in RUB, not USD).
    name: "Cifra Markets",
    spreadPercent: 1.5,
    fixedFee: 6,
    speed: "1 business day (withdrawals only process on bank business days)",
    dataVerified: true,
    notes: "Brokerage platform for CIS-based traders. 1.5% conversion + a 500 RUB withdrawal fee (0 if withdrawing into a Cifra Bank account), cifra.by/rates.",
    notes: "A brokerage platform for CIS-based traders.",
  },
];

// Bank transfer — kept only as a contrasting worst-case baseline, with no
// affiliate link.
const BANK_BASELINE = {
  id: "bank",
  name: "Bank transfer (for comparison)",
  markupPercent: 3,
  fixedFee: 25,
  speed: "3-7 days",
  notes: "Shown for contrast — a bank's rate is typically well below what crypto routes offer.",
};

// E-wallets — reference only, not part of the calculator's math. Used as an
// intermediate step between an exchange and an off-ramp.
const E_WALLETS = [
  {
    id: "payeer",
    name: "Payeer",
    notes: "An e-wallet used as an intermediate step between an exchange and an off-ramp. Check whether it has an affiliate program.",
  },
  {
    id: "advcash",
    name: "AdvCash / Volet",
    notes: "Direct transfers to Russian bank cards no longer work directly, but it's still useful as an intermediate step with off-ramps. Check for an affiliate program.",
  },
];

// A reference resource — not an affiliate partner, more of a competing
// aggregator in this niche.
const REFERENCE_RESOURCES = [
  {
    id: "bestchange",
    name: "BestChange",
    url: "https://www.bestchange.ru/",
    notes: "An exchanger aggregator — useful to cross-check current rates against, but not an affiliate service.",
  },
];

const AFFILIATE_LINKS = {
  bybit: { url: null, label: "Sign up with Bybit" },
  bitget: { url: null, label: "Sign up with Bitget" },
  kucoin: { url: null, label: "Sign up with KuCoin" },
  whitebit: { url: null, label: "Sign up with WhiteBIT" },
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
