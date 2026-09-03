// Fetches mid-market exchange rates from the free Frankfurter API
// (https://www.frankfurter.app/) and caches them in sessionStorage for a
// few minutes to avoid hammering the API while a user tweaks the calculator.

const RATES_CACHE_MS = 5 * 60 * 1000;

async function getMidMarketRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;

  const cacheKey = `rate:${fromCurrency}:${toCurrency}`;
  const cached = readCache(cacheKey);
  if (cached !== null) return cached;

  const url = `https://api.frankfurter.dev/v1/latest?from=${encodeURIComponent(fromCurrency)}&to=${encodeURIComponent(toCurrency)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Rate lookup failed (${response.status})`);
  }
  const data = await response.json();
  const rate = data && data.rates ? data.rates[toCurrency] : undefined;
  if (typeof rate !== "number") {
    throw new Error("Rate not available for this currency pair");
  }

  writeCache(cacheKey, rate);
  return rate;
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { value, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(key);
      return null;
    }
    return value;
  } catch (e) {
    return null;
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(
      key,
      JSON.stringify({ value, expiresAt: Date.now() + RATES_CACHE_MS })
    );
  } catch (e) {
    // sessionStorage unavailable (private mode etc.) — safe to ignore, we
    // just won't cache.
  }
}
