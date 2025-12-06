import * as Location from 'expo-location'

const DEFAULT_CITY = 'Arequipa'
const DEFAULT_COUNTRY = 'PE'

// Configuración de la API
const RAPIDAPI_KEY = '9122f580a8mshd3170f86d0af5eep194e32jsn345b7aa48ef3'
const RAPIDAPI_HOST = 'open-weather13.p.rapidapi.com'
const API_BASE_URL = `https://${RAPIDAPI_HOST}`

export interface WeatherData {
  temp: number
  tempMin: number
  tempMax: number
  humidity: number
  description: string
  icon: string
  city: string
  country: string
  feelsLike: number
  windSpeed: number
}

// Interfaz para la respuesta de la API
interface WeatherApiResponse {
  list?: {
    main?: {
      temp?: number
      feels_like?: number
      temp_min?: number
      temp_max?: number
      humidity?: number
    }
    weather?: {
      description?: string
      icon?: string
    }[]
    wind?: {
      speed?: number
    }
    dt_txt?: string
  }[]
  city?: {
    name?: string
    country?: string
  }
}

// Datos de clima de fallback (en caso de error de API)
const DEFAULT_WEATHER_DATA: WeatherData = {
  temp: 22,
  tempMin: 18,
  tempMax: 26,
  humidity: 75,
  description: 'parcialmente nublado',
  icon: '02d',
  city: DEFAULT_CITY,
  country: DEFAULT_COUNTRY,
  feelsLike: 23,
  windSpeed: 3.5,
}

/**
 * Obtiene la ubicación actual del usuario
 * @returns Promise con las coordenadas de latitud y longitud, o null si hay error
 */
export async function getUserLocation (): Promise<{ latitude: number; longitude: number } | null> {
  try {
    // Solicitar permisos de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      console.warn('Permisos de ubicación denegados')
      return null
    }

    // Obtener ubicación actual
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    })

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
  } catch (error) {
    console.error('Error obteniendo ubicación:', error)
    return null
  }
}

/**
 * Obtiene datos del clima desde la API de OpenWeather
 * @param latitude Latitud de la ubicación
 * @param longitude Longitud de la ubicación
 * @returns Promise con los datos del clima o null si hay error
 */
async function fetchWeatherFromAPI (
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  try {
    const url = `${API_BASE_URL}/fivedaysforcast?latitude=${latitude}&longitude=${longitude}&lang=ES`

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

    const result: WeatherApiResponse = await response.json()

    // Obtener el primer pronóstico (más cercano al tiempo actual)
    if (result.list && result.list.length > 0) {
      const currentForecast = result.list[0]
      const main = currentForecast.main
      const weather = currentForecast.weather?.[0]
      const wind = currentForecast.wind

      if (main && weather) {
        // Convertir de Kelvin a Celsius
        const temp = main.temp ? main.temp - 273.15 : DEFAULT_WEATHER_DATA.temp
        const feelsLike = main.feels_like ? main.feels_like - 273.15 : DEFAULT_WEATHER_DATA.feelsLike
        const tempMin = main.temp_min ? main.temp_min - 273.15 : DEFAULT_WEATHER_DATA.tempMin
        const tempMax = main.temp_max ? main.temp_max - 273.15 : DEFAULT_WEATHER_DATA.tempMax

        return {
          temp: Math.round(temp * 10) / 10, // Redondear a 1 decimal
          tempMin: Math.round(tempMin * 10) / 10,
          tempMax: Math.round(tempMax * 10) / 10,
          humidity: main.humidity || DEFAULT_WEATHER_DATA.humidity,
          description: weather.description || DEFAULT_WEATHER_DATA.description,
          icon: weather.icon || DEFAULT_WEATHER_DATA.icon,
          city: result.city?.name || DEFAULT_CITY,
          country: result.city?.country || DEFAULT_COUNTRY,
          feelsLike: Math.round(feelsLike * 10) / 10,
          windSpeed: wind?.speed || DEFAULT_WEATHER_DATA.windSpeed,
        }
      }
    }

    throw new Error('Formato de respuesta de API inválido')
  } catch (error) {
    console.error('Error obteniendo clima desde API:', error)
    return null
  }
}

/**
 * Obtiene datos del clima usando la ubicación del usuario o valores de fallback
 * @param city Nombre de la ciudad (opcional, se usa como fallback si no hay ubicación)
 * @returns Promise con los datos del clima
 */
export async function getWeather (city: string = DEFAULT_CITY): Promise<WeatherData> {
  // Intentar obtener ubicación del usuario
  const location = await getUserLocation()

  if (location) {
    // Obtener clima desde la API usando la ubicación
    const apiWeather = await fetchWeatherFromAPI(location.latitude, location.longitude)

    if (apiWeather) {
      return apiWeather
    }
  }

  // Si no hay ubicación o la API falla, usar datos de fallback con variaciones según la hora
  console.warn('Usando datos de clima de fallback')
  const hour = new Date().getHours()

  // Ajustar temperatura según la hora (más frío en la noche, más cálido al mediodía)
  let tempVariation = 0
  if (hour >= 6 && hour < 12) {
    tempVariation = 2 // Mañana más cálida
  } else if (hour >= 12 && hour < 18) {
    tempVariation = 4 // Mediodía más cálida
  } else if (hour >= 18 && hour < 22) {
    tempVariation = 1 // Tarde
  } else {
    tempVariation = -2 // Noche más fría
  }

  // Cambiar icono según la hora (día/noche)
  const isDay = hour >= 6 && hour < 20
  const icon = isDay ? '02d' : '02n'

  return {
    ...DEFAULT_WEATHER_DATA,
    city: city,
    temp: DEFAULT_WEATHER_DATA.temp + tempVariation,
    tempMin: DEFAULT_WEATHER_DATA.tempMin + tempVariation - 2,
    tempMax: DEFAULT_WEATHER_DATA.tempMax + tempVariation + 2,
    feelsLike: DEFAULT_WEATHER_DATA.feelsLike + tempVariation,
    icon,
  }
}

/**
 * Retorna la URL para el icono del clima.
 *
 * Esta función depende del servicio público de iconos de OpenWeatherMap (https://openweathermap.org/img/wn/).
 * Nota: El uso de este servicio en producción puede violar los términos de servicio de OpenWeatherMap.
 * Para confiabilidad en producción y cumplimiento legal, considera usar assets locales o iconos con licencia adecuada.
 *
 * @param iconCode El código del icono (ej: '02d')
 * @returns URL string para la imagen del icono
 */
export function getWeatherIconUrl (iconCode: string): string {
  if (!iconCode) {
    // Fallback: retornar un icono genérico si no hay código
    return `https://openweathermap.org/img/wn/01d@2x.png`
  }
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
}

// Función para obtener el emoji del clima basado en el código del icono
export function getWeatherEmoji (iconCode: string): string {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', // sol
    '01n': '🌙', // luna
    '02d': '⛅', // parcialmente nublado día
    '02n': '☁️', // parcialmente nublado noche
    '03d': '☁️', // nublado
    '03n': '☁️',
    '04d': '☁️', // muy nublado
    '04n': '☁️',
    '09d': '🌧️', // lluvia ligera
    '09n': '🌧️',
    '10d': '🌦️', // lluvia con sol
    '10n': '🌧️',
    '11d': '⛈️', // tormenta
    '11n': '⛈️',
    '13d': '❄️', // nieve
    '13n': '❄️',
    '50d': '🌫️', // neblina
    '50n': '🌫️',
  }

  return iconMap[iconCode] || '🌡️'
}
