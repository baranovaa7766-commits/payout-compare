// Переиспользуемый виджет калькулятора сравнения крипто-маршрутов вывода
// (биржа для покупки USDT + off-ramp для конвертации в локальную валюту),
// плюс банк как контрастный baseline. Язык берётся из <html lang="ru|en">.
// Usage: initCalculator('calculator-root', { fundingCurrency: 'USD', localCurrency: 'RUB' })

const CALC_STRINGS = {
  ru: {
    amountLabel: "Сумма выплаты",
    fromLabel: "Валюта фандинга",
    toLabel: "Ваша локальная валюта",
    exchangeLabel: "Биржа для покупки USDT",
    countryLabel: "Страна проживания",
    countryOptional: "(необязательно)",
    countryPlaceholder: "например, Казахстан",
    submitButton: "Сравнить маршруты вывода",
    errorAmount: "Введите сумму выплаты больше 0.",
    loading: "Загружаем актуальный курс обмена…",
    errorRates: "Не удалось загрузить актуальный курс. Попробуйте ещё раз через минуту.",
    countryNote: (country) => `Здесь показано общее сравнение маршрутов. Доступность конкретных сервисов может отличаться для резидентов страны «<strong>${country}</strong>» — уточните это у сервиса перед выбором.`,
    thMethod: "Маршрут",
    thRate: "Курс",
    thFee: "Комиссия",
    thSpeed: "Скорость",
    thReceive: "Получите на руки",
    bestBadge: "Выгоднее всего",
    unverifiedBadge: "не подтверждено",
    feeMarkup: (percent) => `~${percent}% спред`,
    feeFlat: (amount) => `${amount} фикс.`,
    feeNone: "Не раскрывается",
    disclaimer: 'Оценка на основе типичных опубликованных спредов и комиссий — фактический курс зависит от сервиса, суммы и рыночной ситуации. Данные по off-ramp сервисам пока не подтверждены напрямую поддержкой — уточняйте перед выводом. См.',
    disclaimerLinkText: "раскрытие информации о партнёрских ссылках",
    disclosureHref: "/disclosure/",
    getStarted: "Оформить",
    locale: "ru-RU",
  },
  en: {
    amountLabel: "Payout amount",
    fromLabel: "Funding currency",
    toLabel: "Your local currency",
    exchangeLabel: "Exchange to buy USDT",
    countryLabel: "Country of residence",
    countryOptional: "(optional)",
    countryPlaceholder: "e.g. Kazakhstan",
    submitButton: "Compare payout routes",
    errorAmount: "Enter a payout amount greater than 0.",
    loading: "Fetching live exchange rates…",
    errorRates: "Couldn't fetch live rates right now. Please try again in a moment.",
    countryNote: (country) => `Showing a generic comparison of routes. Availability of specific services can vary for residents of <strong>${country}</strong> — confirm with the provider before choosing.`,
    thMethod: "Route",
    thRate: "Rate",
    thFee: "Fee",
    thSpeed: "Speed",
    thReceive: "You receive",
    bestBadge: "Best value",
    unverifiedBadge: "unconfirmed",
    feeMarkup: (percent) => `~${percent}% spread`,
    feeFlat: (amount) => `${amount} flat`,
    feeNone: "None disclosed",
    disclaimer: "Estimates based on typical published spreads and fees — actual rates vary by provider, amount, and market conditions. Off-ramp figures haven't been confirmed directly with support yet — verify before withdrawing. See our",
    disclaimerLinkText: "disclosure",
    disclosureHref: "/en/disclosure/",
    getStarted: "Get started",
    locale: "en-US",
  },
};

function getCalcLang() {
  return document.documentElement.lang === "en" ? "en" : "ru";
}

function initCalculator(rootId, options) {
  const root = document.getElementById(rootId);
  if (!root) return;

  const opts = Object.assign(
    {
      fundingCurrency: "USD",
      localCurrency: "RUB",
      amount: 1000,
      exchanges: typeof EXCHANGES !== "undefined" ? EXCHANGES : [],
      offramps: typeof OFFRAMPS !== "undefined" ? OFFRAMPS : [],
      bank: typeof BANK_BASELINE !== "undefined" ? BANK_BASELINE : null,
    },
    options || {}
  );

  const t = CALC_STRINGS[getCalcLang()];

  root.innerHTML = buildFormHTML(opts, t);

  const form = root.querySelector("form");
  const resultEl = root.querySelector(".calc-result");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runCalculation(form, resultEl, opts, t);
  });

  // Считаем сразу при загрузке, чтобы виджет не был пустым.
  runCalculation(form, resultEl, opts, t);
}

function buildFormHTML(opts, t) {
  const currencyOptions = (list, selected) =>
    list
      .map((c) => `<option value="${c}" ${c === selected ? "selected" : ""}>${c}</option>`)
      .join("");

  // USDT can be a funding currency (e.g. a firm pays out in crypto directly)
  // but doesn't make sense as the target "local currency", so it's only
  // added to the "from" list, right after USD.
  const fundingCurrencies = [CURRENCIES[0], "USDT", ...CURRENCIES.slice(1)];

  const exchangeOptions = opts.exchanges
    .map((e) => `<option value="${e.id}">${e.name}</option>`)
    .join("");

  return `
    <form class="calc-form">
      <div class="calc-field">
        <label for="calc-amount">${t.amountLabel}</label>
        <input id="calc-amount" name="amount" type="number" min="1" step="0.01" value="${opts.amount}" required />
      </div>
      <div class="calc-field">
        <label for="calc-from">${t.fromLabel}</label>
        <select id="calc-from" name="from">${currencyOptions(fundingCurrencies, opts.fundingCurrency)}</select>
      </div>
      <div class="calc-field">
        <label for="calc-to">${t.toLabel}</label>
        <select id="calc-to" name="to">${currencyOptions(CURRENCIES, opts.localCurrency)}</select>
      </div>
      <div class="calc-field">
        <label for="calc-exchange">${t.exchangeLabel}</label>
        <select id="calc-exchange" name="exchange">${exchangeOptions}</select>
      </div>
      <div class="calc-field">
        <label for="calc-country">${t.countryLabel} <span class="optional">${t.countryOptional}</span></label>
        <input id="calc-country" name="country" type="text" placeholder="${t.countryPlaceholder}" />
      </div>
      <button type="submit" class="calc-submit">${t.submitButton}</button>
    </form>
    <div class="calc-result" aria-live="polite"></div>
  `;
}

async function runCalculation(form, resultEl, opts, t) {
  const formData = new FormData(form);
  const amount = parseFloat(formData.get("amount"));
  const from = formData.get("from");
  const to = formData.get("to");
  const country = (formData.get("country") || "").trim();
  const exchangeId = formData.get("exchange");
  const exchange = opts.exchanges.find((e) => e.id === exchangeId) || opts.exchanges[0];

  if (!amount || amount <= 0) {
    resultEl.innerHTML = `<p class="calc-error">${t.errorAmount}</p>`;
    return;
  }

  resultEl.innerHTML = `<p class="calc-loading">${t.loading}</p>`;

  // USDT isn't an ISO currency the rate API knows about — it trades ~1:1
  // with USD, so look up USD and use that as the mid-market rate.
  const skipExchange = from === "USDT";
  const apiFrom = skipExchange ? "USD" : from;

  let rate;
  try {
    rate = await getMidMarketRate(apiFrom, to);
  } catch (err) {
    resultEl.innerHTML = `<p class="calc-error">${t.errorRates}</p>`;
    return;
  }

  const routeRows = opts.offramps.map((offramp) => {
    if (skipExchange) {
      // Already holding USDT — there's no "buy USDT" leg, just the off-ramp.
      const amountAfterFees = Math.max(amount - offramp.fixedFee, 0);
      const effectiveRate = rate * (1 - offramp.spreadPercent / 100);
      const finalAmount = amountAfterFees * effectiveRate;
      return {
        name: offramp.name,
        finalAmount,
        effectiveRate,
        feeText: formatFee(offramp.spreadPercent, offramp.fixedFee, from, t),
        speed: offramp.speed,
        linkId: null,
        unverified: !offramp.affiliateConfirmed,
      };
    }
    // Комиссии двух этапов вычитаются последовательно (эквивалентно вычитанию
    // суммы), а спреды перемножаются: итоговый спред = 1 - (1-e)(1-o).
    const amountAfterFees = Math.max(amount - exchange.fixedFee - offramp.fixedFee, 0);
    const combinedSpreadPercent =
      100 * (1 - (1 - exchange.spreadPercent / 100) * (1 - offramp.spreadPercent / 100));
    const effectiveRate = rate * (1 - combinedSpreadPercent / 100);
    const finalAmount = amountAfterFees * effectiveRate;
    return {
      name: `${exchange.name} → ${offramp.name}`,
      finalAmount,
      effectiveRate,
      feeText: formatFee(combinedSpreadPercent, exchange.fixedFee + offramp.fixedFee, from, t),
      speed: `${exchange.speed} + ${offramp.speed}`,
      linkId: exchange.id,
      unverified: !offramp.affiliateConfirmed,
    };
  });

  const bankRow = opts.bank && !skipExchange
    ? (() => {
        const amountAfterFee = Math.max(amount - opts.bank.fixedFee, 0);
        const effectiveRate = rate * (1 - opts.bank.markupPercent / 100);
        const finalAmount = amountAfterFee * effectiveRate;
        return {
          name: opts.bank.name,
          finalAmount,
          effectiveRate,
          feeText: formatFee(opts.bank.markupPercent, opts.bank.fixedFee, from, t),
          speed: opts.bank.speed,
          linkId: null,
          unverified: false,
        };
      })()
    : null;

  const rows = bankRow ? [...routeRows, bankRow] : routeRows;
  rows.sort((a, b) => b.finalAmount - a.finalAmount);
  const best = rows[0];

  resultEl.innerHTML = `
    ${country ? `<p class="calc-country-note">${t.countryNote(escapeHTML(country))}</p>` : ""}
    <div class="calc-table-wrap">
      <table class="calc-table">
        <thead>
          <tr>
            <th>${t.thMethod}</th>
            <th>${t.thRate}</th>
            <th>${t.thFee}</th>
            <th>${t.thSpeed}</th>
            <th>${t.thReceive}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
            <tr class="${row === best ? "calc-best" : ""}">
              <td data-label="${t.thMethod}">
                ${row.name}
                ${row === best ? `<span class="calc-badge">${t.bestBadge}</span>` : ""}
                ${row.unverified ? `<span class="calc-unverified">${t.unverifiedBadge}</span>` : ""}
              </td>
              <td data-label="${t.thRate}">1 ${from} = ${row.effectiveRate.toFixed(4)} ${to}</td>
              <td data-label="${t.thFee}">${row.feeText}</td>
              <td data-label="${t.thSpeed}">${row.speed}</td>
              <td data-label="${t.thReceive}"><strong>${formatMoney(row.finalAmount, to, t)}</strong></td>
              <td data-label="">${linkForId(row.linkId, t)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <p class="calc-disclaimer">${t.disclaimer} <a href="${t.disclosureHref}">${t.disclaimerLinkText}</a>.</p>
  `;
}

function formatFee(percent, fixedFee, currency, t) {
  const parts = [];
  if (percent) parts.push(t.feeMarkup(round1(percent)));
  if (fixedFee) parts.push(t.feeFlat(formatMoney(fixedFee, currency, t)));
  return parts.length ? parts.join(" + ") : t.feeNone;
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function formatMoney(value, currency, t) {
  try {
    return new Intl.NumberFormat(t.locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (e) {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function linkForId(id, t) {
  if (!id) return "";
  const link = (typeof AFFILIATE_LINKS !== "undefined" && AFFILIATE_LINKS[id]) || {};
  if (link.url) {
    return `<a class="calc-link" href="${link.url}" target="_blank" rel="noopener sponsored">${t.getStarted}</a>`;
  }
  return "";
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
