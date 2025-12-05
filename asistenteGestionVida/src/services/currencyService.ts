// Servicio para obtener tasas de cambio de moneda
// Usando tipos de cambio fijos

// Tipos de cambio fijos
const USD_TO_PEN = 3.36 // 1 USD = 3.36 PEN
const USD_TO_EUR = 0.92 // 1 USD = 0.92 EUR (aproximado)
const EUR_TO_PEN = USD_TO_PEN / USD_TO_EUR // 1 EUR ≈ 3.65 PEN

// Tasas de cambio disponibles
const EXCHANGE_RATES: { [key: string]: { [key: string]: number } } = {
  USD: {
    PEN: USD_TO_PEN,
    EUR: USD_TO_EUR,
    USD: 1,
  },
  PEN: {
    USD: 1 / USD_TO_PEN,
    EUR: 1 / EUR_TO_PEN,
    PEN: 1,
  },
  EUR: {
    USD: 1 / USD_TO_EUR,
    PEN: EUR_TO_PEN,
    EUR: 1,
  },
}

export interface CurrencyInfo {
  usdToPen: number
  usdToEur: number
  eurToPen: number
  lastUpdate: string
}

// Obtener la tasa de cambio USD a PEN
export function getExchangeRate (): number {
  return USD_TO_PEN
}

// Obtener múltiples tasas de cambio
export function getMultipleExchangeRates (): CurrencyInfo {
  const today = new Date().toISOString().split('T')[0]

  return {
    usdToPen: USD_TO_PEN,
    usdToEur: USD_TO_EUR,
    eurToPen: EUR_TO_PEN,
    lastUpdate: today,
  }
}

// Función para convertir una cantidad de una moneda a otra
export function convertCurrency (
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'PEN'
): number | null {
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  if (!EXCHANGE_RATES[from] || !EXCHANGE_RATES[from][to]) {
    console.error(`No se encontró la tasa de cambio de ${from} a ${to}`)
    return null
  }

  const rate = EXCHANGE_RATES[from][to]
  return amount * rate
}

// Formatear moneda en formato peruano
export function formatPEN (amount: number): string {
  return `S/ ${amount.toFixed(2)}`
}

// Formatear moneda en formato USD
export function formatUSD (amount: number): string {
  return `$ ${amount.toFixed(2)}`
}
