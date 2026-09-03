// Переиспользуемый виджет калькулятора сравнения выплат / reusable payout
// comparison calculator widget. Язык берётся из <html lang="ru|en">.
// Usage: initCalculator('calculator-root', { fundingCurrency: 'USD' })

const CALC_STRINGS = {
  ru: {
    amountLabel: "Сумма выплаты",
    fromLabel: "Валюта фандинга",
    toLabel: "Ваша локальная валюта",
    countryLabel: "Страна проживания",
    countryOptional: "(необязательно)",
    countryPlaceholder: "например, Германия",
    submitButton: "Сравнить способы вывода",
    errorAmount: "Введите сумму выплаты больше 0.",
    loading: "Загружаем актуальный курс обмена…",
    errorRates: "Не удалось загрузить актуальный курс. Попробуйте ещё раз через минуту.",
    countryNote: (country) => `Здесь показано общее сравнение способов. Доступность конкретных провайдеров может отличаться для резидентов страны «<strong>${country}</strong>» — уточните это у провайдера перед выбором.`,
    thMethod: "Способ",
    thRate: "Курс",
    thFee: "Комиссия",
    thSpeed: "Скорость",
    thReceive: "Получите на руки",
    bestBadge: "Выгоднее всего",
    feeMarkup: (percent) => `~${percent}% наценка к курсу`,
    feeFlat: (amount) => `${amount} фикс.`,
    feeNone: "Не раскрывается",
    disclaimer: 'Оценка на основе типичных опубликованных наценок и комиссий — фактический курс зависит от провайдера, направления перевода и рыночной ситуации. Всегда сверяйте актуальный курс перед выводом средств. См.',
    disclaimerLinkText: "раскрытие информации о партнёрских ссылках",
    disclosureHref: "/disclosure/",
    getStarted: "Оформить",
    locale: "ru-RU",
  },
  en: {
    amountLabel: "Payout amount",
    fromLabel: "Funding currency",
    toLabel: "Your local currency",
    countryLabel: "Country of residence",
    countryOptional: "(optional)",
    countryPlaceholder: "e.g. Germany",
    submitButton: "Compare payout methods",
    errorAmount: "Enter a payout amount greater than 0.",
    loading: "Fetching live exchange rates…",
    errorRates: "Couldn't fetch live rates right now. Please try again in a moment.",
    countryNote: (country) => `Showing generic method comparisons. Availability of specific providers can vary for residents of <strong>${country}</strong> — confirm with the provider before choosing.`,
    thMethod: "Method",
    thRate: "Rate",
    thFee: "Fee",
    thSpeed: "Speed",
    thReceive: "You receive",
    bestBadge: "Best value",
    feeMarkup: (percent) => `~${percent}% FX markup`,
    feeFlat: (amount) => `${amount} flat`,
    feeNone: "None disclosed",
    disclaimer: "Estimates based on typical published markups and fees as of publication — actual rates vary by provider, corridor, and market conditions. Always confirm the live rate before withdrawing. See our",
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
      localCurrency: "EUR",
      amount: 1000,
      methods: METHODS,
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
  const currencyOptions = (selected) =>
    CURRENCIES.map(
      (c) => `<option value="${c}" ${c === selected ? "selected" : ""}>${c}</option>`
    ).join("");

  return `
    <form class="calc-form">
      <div class="calc-field">
        <label for="calc-amount">${t.amountLabel}</label>
        <input id="calc-amount" name="amount" type="number" min="1" step="0.01" value="${opts.amount}" required />
      </div>
      <div class="calc-field">
        <label for="calc-from">${t.fromLabel}</label>
        <select id="calc-from" name="from">${currencyOptions(opts.fundingCurrency)}</select>
      </div>
      <div class="calc-field">
        <label for="calc-to">${t.toLabel}</label>
        <select id="calc-to" name="to">${currencyOptions(opts.localCurrency)}</select>
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

  if (!amount || amount <= 0) {
    resultEl.innerHTML = `<p class="calc-error">${t.errorAmount}</p>`;
    return;
  }

  resultEl.innerHTML = `<p class="calc-loading">${t.loading}</p>`;

  let rate;
  try {
    rate = await getMidMarketRate(from, to);
  } catch (err) {
    resultEl.innerHTML = `<p class="calc-error">${t.errorRates}</p>`;
    return;
  }

  const rows = opts.methods
    .map((method) => {
      const amountAfterFee = Math.max(amount - method.fixedFee, 0);
      const effectiveRate = rate * (1 - method.markupPercent / 100);
      const finalAmount = amountAfterFee * effectiveRate;
      return { method, finalAmount, effectiveRate };
    })
    .sort((a, b) => b.finalAmount - a.finalAmount);

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
                ${row.method.name}
                ${row === best ? `<span class="calc-badge">${t.bestBadge}</span>` : ""}
              </td>
              <td data-label="${t.thRate}">1 ${from} = ${row.effectiveRate.toFixed(4)} ${to}</td>
              <td data-label="${t.thFee}">${formatFee(row.method, from, t)}</td>
              <td data-label="${t.thSpeed}">${row.method.speed}</td>
              <td data-label="${t.thReceive}"><strong>${formatMoney(row.finalAmount, to, t)}</strong></td>
              <td data-label="">${linkForMethod(row.method, t)}</td>
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

function formatFee(method, currency, t) {
  const parts = [];
  if (method.markupPercent) parts.push(t.feeMarkup(method.markupPercent));
  if (method.fixedFee) parts.push(t.feeFlat(formatMoney(method.fixedFee, currency, t)));
  return parts.length ? parts.join(" + ") : t.feeNone;
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

function linkForMethod(method, t) {
  const link = (typeof AFFILIATE_LINKS !== "undefined" && AFFILIATE_LINKS[method.id]) || {};
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
