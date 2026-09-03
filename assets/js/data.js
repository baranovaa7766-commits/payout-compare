// Статические данные о крипто-маршрутах вывода, пропфирмах и партнёрских
// ссылках. Цифры по комиссиям/спредам — оценочные, для целей сравнения.
// Перед выводом средств всегда уточняйте актуальные условия у самого сервиса.
//
// v2: сайт сравнивает не Wise/Revolut/банк, а связки "биржа (покупка USDT) +
// off-ramp (USDT → рубли/локальная валюта)", потому что Wise и Revolut не
// работают с пользователями из России. Банк оставлен как контрастный худший
// вариант. См. payout-comparison-site-spec-v2-crypto-pivot.md.

const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "CHF", "JPY", "PLN", "CZK", "HUF", "RON", "BGN", "TRY", "INR", "ZAR", "MXN", "BRL", "NGN", "SEK", "NOK", "DKK", "RUB", "KZT", "UAH", "BYN"];

// Криптобиржи — этап 1 (покупка/получение USDT). Партнёрские программы
// подтверждены для всех четырёх.
const EXCHANGES = [
  {
    id: "bybit",
    name: "Bybit",
    spreadPercent: 0.3,
    fixedFee: 1,
    speed: "минуты",
    affiliateConfirmed: true,
    notes: "Партнёрка подтверждена (affiliates.bybit.com); обязательной ID-верификации для самой партнёрки нет.",
  },
  {
    id: "bitget",
    name: "Bitget",
    spreadPercent: 0.3,
    fixedFee: 1,
    speed: "минуты",
    affiliateConfirmed: true,
    notes: "Относительно мягкий порог входа в партнёрскую программу.",
  },
  {
    id: "kucoin",
    name: "KuCoin",
    spreadPercent: 0.3,
    fixedFee: 1,
    speed: "минуты",
    affiliateConfirmed: true,
    notes: "Открытая партнёрская программа, 30-50% от комиссий пожизненно.",
  },
  {
    id: "whitebit",
    name: "WhiteBIT",
    spreadPercent: 0.4,
    fixedFee: 1,
    speed: "минуты",
    affiliateConfirmed: true,
    notes: "Партнёрская программа подтверждена (whitebit.com/referral).",
  },
];

// Off-ramp сервисы — этап 2 (USDT → рубли/локальная валюта). Партнёрские
// программы НЕ ПОДТВЕРЖДЕНЫ — цифры ниже предварительные, до уточнения у
// поддержки каждого сервиса.
const OFFRAMPS = [
  {
    id: "whitebird",
    name: "Whitebird",
    spreadPercent: 1.5,
    fixedFee: 1,
    speed: "10-30 минут",
    affiliateConfirmed: false,
    notes: "Лицензированная площадка (Беларусь): USDT/BTC/ETH → RUB/BYN на карту МИР.",
  },
  {
    id: "a7a5",
    name: "A7A5",
    spreadPercent: 1.7,
    fixedFee: 1,
    speed: "10-30 минут",
    affiliateConfirmed: false,
    notes: "Альтернатива Whitebird для стран СНГ.",
  },
  {
    id: "cifra",
    name: "Cifra Markets",
    spreadPercent: 2,
    fixedFee: 1,
    speed: "не указана — уточняется",
    affiliateConfirmed: false,
    notes: "Брокерская платформа для трейдеров СНГ.",
  },
];

// Банковский перевод — оставлен только как контрастный "худший" вариант,
// без партнёрской ссылки.
const BANK_BASELINE = {
  id: "bank",
  name: "Банковский перевод (для сравнения)",
  markupPercent: 3,
  fixedFee: 25,
  speed: "3-7 дней",
  notes: "Показан для контраста — курс банка обычно заметно хуже крипто-маршрутов.",
};

// Электронные кошельки — справочно, не участвуют в расчёте калькулятора.
// Используются как промежуточное звено между биржей и обменником.
const E_WALLETS = [
  {
    id: "payeer",
    name: "Payeer",
    notes: "Электронный кошелёк, используется как промежуточное звено между биржей и обменником. Наличие партнёрской программы нужно проверить на сайте.",
  },
  {
    id: "advcash",
    name: "AdvCash / Volet",
    notes: "Прямые переводы на карты РФ напрямую больше не работают, но кошелёк полезен как промежуточное звено с обменниками. Партнёрку нужно проверить на сайте.",
  },
];

// Справочный ресурс — не партнёр, а агрегатор-конкурент в узкой нише.
const REFERENCE_RESOURCES = [
  {
    id: "bestchange",
    name: "BestChange",
    url: "https://www.bestchange.ru/",
    notes: "Агрегатор обменников — можно свериться с ним по актуальным курсам, но это не партнёрский сервис.",
  },
];

// Конфигурация партнёрских ссылок. После одобрения в партнёрской программе
// подставьте реальную ссылку в поле `url`. Пока `url: null` — ссылка не
// монетизирована и не отображается.
const AFFILIATE_LINKS = {
  bybit: { url: null, label: "Зарегистрироваться в Bybit" },
  bitget: { url: null, label: "Зарегистрироваться в Bitget" },
  kucoin: { url: null, label: "Зарегистрироваться в KuCoin" },
  whitebit: { url: null, label: "Зарегистрироваться в WhiteBIT" },
};

// Данные по выплатам пропфирм собраны через веб-поиск.
// ВАЖНО: перед публикацией каждой страницы проверяйте актуальные условия
// напрямую на сайте фирмы — эти данные могут быть неточными или устаревшими.
const FIRMS = [
  {
    slug: "ftmo",
    name: "FTMO",
    methods: [
      "Банковский перевод",
      "Visa Direct / Mastercard Send (до $20 000)",
      "Skrill (до $3 000)",
      "Крипто",
    ],
    fee: "Комиссии от фирмы нет; банк может взимать свою за входящий перевод",
    minWithdrawal: "$20 (банк) / $50 (крипто)",
    speed: "1-2 дня",
    notes: "Банковский перевод недоступен трейдерам из Венесуэлы, Кубы, Судана и Украины.",
    payoutCurrency: "USD",
  },
  {
    slug: "fundednext",
    name: "FundedNext",
    methods: ["USDT/USDC (крипто)", "RiseWorks", "Банковский перевод", "Confirmo"],
    fee: "До 3% (оплачивает трейдер)",
    minWithdrawal: "Не указана — проверьте перед тем как полагаться на это",
    speed: "24 часа (крипто/RiseWorks), до 5 дней (банк)",
    notes: "RiseWorks доступен только в отдельных регионах; трейдерам из Ирана доступен только TC Pay.",
    payoutCurrency: "USD",
  },
  {
    slug: "the5ers",
    name: "The5ers",
    methods: ["RiseWorks", "Крипто", "Банковский перевод", "Hub Credits"],
    fee: "Банк 3%, крипто/RiseWorks 2% (в некоторых источниках — фиксированные 3,5%) — уточните перед тем как полагаться на это",
    minWithdrawal: "$150",
    speed: "~72 часа, выплаты раз в две недели",
    notes: "Вывод через крипто ограничен суммой $1 500 за одну заявку.",
    payoutCurrency: "USD",
  },
  {
    slug: "e8-markets",
    name: "E8 Markets",
    methods: ["RiseWorks", "WorkMarket"],
    fee: "Комиссии от фирмы нет",
    minWithdrawal: "$100",
    speed: "Не указана — проверьте перед тем как полагаться на это",
    notes: "",
    payoutCurrency: "USD",
  },
];
