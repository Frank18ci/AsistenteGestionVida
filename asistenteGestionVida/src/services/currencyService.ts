// Servicio para obtener tasas de cambio de moneda
// Usando API de RapidAPI para obtener tasas en tiempo real

// Configuración de la API
const RAPIDAPI_KEY = '9122f580a8mshd3170f86d0af5eep194e32jsn345b7aa48ef3'
const RAPIDAPI_HOST = 'currency-conversion-and-exchange-rates.p.rapidapi.com'
const API_BASE_URL = `https://${RAPIDAPI_HOST}`

// Tipos de cambio de fallback (en caso de error de API)
// Tasa fija del 01/01/2025
const USD_TO_PEN_FALLBACK = 3.37 // 1 USD = 3.37 PEN
const USD_TO_EUR_FALLBACK = 0.92 // 1 USD = 0.92 EUR (aproximado)
const EUR_TO_PEN_FALLBACK = USD_TO_PEN_FALLBACK / USD_TO_EUR_FALLBACK // 1 EUR ≈ 3.65 PEN

// Interfaz para la respuesta de la API
interface ApiResponse {
  rates?: {
    [key: string]: number
  }
  base?: string
  date?: string
}

// Cache de tasas de cambio (para evitar llamadas excesivas)
let cachedRates: CurrencyInfo | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos

export interface CurrencyInfo {
  usdToPen: number
  usdToEur: number
  eurToPen: number
  lastUpdate: string
}

/**
 * Obtiene las tasas de cambio desde la API de RapidAPI
 * @returns Promise con las tasas de cambio o null si hay error
 */
async function fetchExchangeRatesFromAPI (): Promise<CurrencyInfo | null> {
  try {
    // Usar el endpoint 'latest' para obtener las tasas actuales
    const url = `${API_BASE_URL}/latest?base=USD&symbols=EUR,PEN`

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
      },
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`)
    }

    const result: ApiResponse = await response.json()

    if (result.rates && result.rates.EUR && result.rates.PEN) {
      const usdToEur = result.rates.EUR
      const usdToPen = result.rates.PEN
      const eurToPen = usdToPen / usdToEur
      const lastUpdate = result.date || new Date().toISOString().split('T')[0]

      return {
        usdToPen,
        usdToEur,
        eurToPen,
        lastUpdate,
      }
    }

    throw new Error('Formato de respuesta de API inválido')
  } catch (error) {
    console.error('Error obteniendo tasas de cambio desde API:', error)
    return null
  }
}

/**
 * Obtiene las tasas de cambio usando la API o valores de fallback
 * @param useCache Si es true, usa el cache si está disponible y no ha expirado
 * @returns Promise con las tasas de cambio
 */
export async function getMultipleExchangeRates (useCache: boolean = true): Promise<CurrencyInfo> {
  // Verificar cache si está habilitado
  if (useCache && cachedRates && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedRates
  }

  // Intentar obtener desde la API
  const apiRates = await fetchExchangeRatesFromAPI()

  if (apiRates) {
    // Actualizar cache
    cachedRates = apiRates
    cacheTimestamp = Date.now()
    return apiRates
  }

  // Si la API falla, usar valores de fallback
  console.warn('Usando tasas de cambio de fallback debido a error en la API')
  const today = new Date().toISOString().split('T')[0]

  const fallbackRates: CurrencyInfo = {
    usdToPen: USD_TO_PEN_FALLBACK,
    usdToEur: USD_TO_EUR_FALLBACK,
    eurToPen: EUR_TO_PEN_FALLBACK,
    lastUpdate: today,
  }

  // No cachear valores de fallback para que intente la API en la próxima llamada
  return fallbackRates
}

/**
 * Obtiene la tasa de cambio USD a PEN (versión asíncrona)
 * @returns Promise con la tasa de cambio
 */
export async function getExchangeRate (): Promise<number> {
  const rates = await getMultipleExchangeRates()
  return rates.usdToPen
}

/**
 * Función para convertir una cantidad de una moneda a otra
 * @param amount Cantidad a convertir
 * @param fromCurrency Moneda origen (USD, EUR, PEN)
 * @param toCurrency Moneda destino (USD, EUR, PEN)
 * @returns Promise con el monto convertido o null si hay error
 */
export async function convertCurrency (
  amount: number,
  fromCurrency: string = 'USD',
  toCurrency: string = 'PEN'
): Promise<number | null> {
  const from = fromCurrency.toUpperCase()
  const to = toCurrency.toUpperCase()

  // Si es la misma moneda, retornar el mismo monto
  if (from === to) {
    return amount
  }

  try {
    const rates = await getMultipleExchangeRates()

    // Construir la tasa de conversión
    let rate: number

    if (from === 'USD' && to === 'PEN') {
      rate = rates.usdToPen
    } else if (from === 'USD' && to === 'EUR') {
      rate = rates.usdToEur
    } else if (from === 'EUR' && to === 'PEN') {
      rate = rates.eurToPen
    } else if (from === 'PEN' && to === 'USD') {
      rate = 1 / rates.usdToPen
    } else if (from === 'EUR' && to === 'USD') {
      rate = 1 / rates.usdToEur
    } else if (from === 'PEN' && to === 'EUR') {
      rate = 1 / rates.eurToPen
    } else {
      console.error(`Conversión no soportada: ${from} a ${to}`)
      return null
    }

    return amount * rate
  } catch (error) {
    console.error(`Error convirtiendo ${from} a ${to}:`, error)
    return null
  }
}

// Formatear moneda en formato peruano
export function formatPEN (amount: number): string {
  return `S/ ${amount.toFixed(2)}`
}

// Formatear moneda en formato USD
export function formatUSD (amount: number): string {
  return `$ ${amount.toFixed(2)}`
}
