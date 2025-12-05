const DEFAULT_CITY = 'Arequipa'
const DEFAULT_COUNTRY = 'PE'

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

// Datos de clima simulados para Arequipa
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

// Obtener datos de clima (simulado)
export function getWeather (city: string = DEFAULT_CITY): WeatherData {
  // Retornar datos fijos con variaciones ligeras según la hora del día
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
    city: city || DEFAULT_CITY,
    temp: DEFAULT_WEATHER_DATA.temp + tempVariation,
    tempMin: DEFAULT_WEATHER_DATA.tempMin + tempVariation - 2,
    tempMax: DEFAULT_WEATHER_DATA.tempMax + tempVariation + 2,
    feelsLike: DEFAULT_WEATHER_DATA.feelsLike + tempVariation,
    icon,
  }
}

// Función para obtener el icono del clima
export function getWeatherIconUrl (iconCode: string): string {
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
