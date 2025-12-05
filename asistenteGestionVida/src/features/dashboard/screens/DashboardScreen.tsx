import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { CurrencyInfo, getMultipleExchangeRates } from '../../../services/currencyService'
import { getWeather, getWeatherEmoji, getWeatherIconUrl, WeatherData } from '../../../services/weatherService'

export default function DashboardScreen () {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = () => {
    try {
      // Ambas funciones ahora son síncronas
      const rateData = getMultipleExchangeRates()
      setCurrencyInfo(rateData)

      const weatherData = getWeather('Arequipa')
      setWeather(weatherData)
    } catch (error) {
      console.error('Error cargando datos:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Obtener saludo según la hora del día
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  // Obtener emoji según la hora
  const getTimeEmoji = () => {
    const hour = new Date().getHours()
    if (hour < 6) return '🌙'
    if (hour < 12) return '🌅'
    if (hour < 18) return '☀️'
    if (hour < 21) return '🌆'
    return '🌙'
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Cargando información del día...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#6366F1']}
          tintColor="#6366F1"
        />
      }
    >
      {/* Header con saludo */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()} {getTimeEmoji()}</Text>
        <Text style={styles.headerTitle}>Mi Asistente de Vida</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('es-PE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      {/* Tarjeta de Clima */}
      <View style={styles.weatherCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>🌤️ Clima Actual</Text>
          {weather && (
            <Text style={styles.cityBadge}>📍 {weather.city}</Text>
          )}
        </View>

        {weather ? (
          <View style={styles.weatherContent}>
            <View style={styles.weatherMain}>
              <View style={styles.tempContainer}>
                <Image
                  source={{ uri: getWeatherIconUrl(weather.icon) }}
                  style={styles.weatherIcon}
                />
                <Text style={styles.tempText}>{Math.round(weather.temp)}°C</Text>
              </View>
              <Text style={styles.weatherDescription}>
                {getWeatherEmoji(weather.icon)} {weather.description}
              </Text>
            </View>

            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.detailLabel}>Sensación</Text>
                <Text style={styles.detailValue}>{Math.round(weather.feelsLike)}°C</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.detailLabel}>Humedad</Text>
                <Text style={styles.detailValue}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Text style={styles.detailLabel}>Viento</Text>
                <Text style={styles.detailValue}>{weather.windSpeed} m/s</Text>
              </View>
            </View>

            <View style={styles.tempRange}>
              <Text style={styles.tempRangeText}>
                ⬇️ {Math.round(weather.tempMin)}° / ⬆️ {Math.round(weather.tempMax)}°
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorText}>No se pudo cargar el clima</Text>
            <Text style={styles.errorHint}>Desliza hacia abajo para reintentar</Text>
          </View>
        )}
      </View>

      {/* Tarjeta de Economía */}
      <View style={styles.currencyCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>💰 Economía</Text>
          {currencyInfo && (
            <Text style={styles.updateBadge}>
              📅 {currencyInfo.lastUpdate}
            </Text>
          )}
        </View>

        {currencyInfo ? (
          <View style={styles.currencyContent}>
            <View style={styles.mainRate}>
              <Text style={styles.rateLabel}>Dólar Americano (USD)</Text>
              <View style={styles.rateValueContainer}>
                <Text style={styles.rateValue}>S/ {currencyInfo.usdToPen.toFixed(3)}</Text>
                <Text style={styles.rateCurrency}>PEN</Text>
              </View>
            </View>

            <View style={styles.otherRates}>
              <View style={styles.rateItem}>
                <Text style={styles.smallRateLabel}>EUR → PEN</Text>
                <Text style={styles.smallRateValue}>S/ {currencyInfo.eurToPen.toFixed(3)}</Text>
              </View>
              <View style={styles.rateDivider} />
              <View style={styles.rateItem}>
                <Text style={styles.smallRateLabel}>USD → EUR</Text>
                <Text style={styles.smallRateValue}>€ {currencyInfo.usdToEur.toFixed(3)}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>📉</Text>
            <Text style={styles.errorText}>No se pudo cargar el tipo de cambio</Text>
            <Text style={styles.errorHint}>Desliza hacia abajo para reintentar</Text>
          </View>
        )}
      </View>

      {/* Resumen General */}
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>📋 Resumen del día</Text>
        <View style={styles.summaryContent}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEE2E2' }]}>
              <Text style={styles.summaryIconText}>✅</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Tareas</Text>
              <Text style={styles.summaryValue}>Próximamente</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.summaryIconText}>💵</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Finanzas</Text>
              <Text style={styles.summaryValue}>Próximamente</Text>
            </View>
          </View>

          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.summaryIconText}>📝</Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryLabel}>Notas</Text>
              <Text style={styles.summaryValue}>Próximamente</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Espacio al final */}
      <View style={{ height: 30 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },

  // Header
  header: {
    backgroundColor: '#6366F1',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'capitalize',
  },

  // Cards comunes
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  cityBadge: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updateBadge: {
    fontSize: 11,
    color: '#6B7280',
  },

  // Weather Card
  weatherCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: -15,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  weatherContent: {},
  weatherMain: {
    alignItems: 'center',
    marginBottom: 15,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 80,
    height: 80,
  },
  tempText: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  weatherDescription: {
    fontSize: 18,
    textTransform: 'capitalize',
    color: '#6B7280',
    marginTop: 5,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  tempRange: {
    alignItems: 'center',
  },
  tempRangeText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Currency Card
  currencyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  currencyContent: {},
  mainRate: {
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  rateValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  rateValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#059669',
  },
  rateCurrency: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  otherRates: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
  },
  rateItem: {
    alignItems: 'center',
    flex: 1,
  },
  rateDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  smallRateLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  smallRateValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryContent: {
    marginTop: 10,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  summaryIconText: {
    fontSize: 20,
  },
  summaryInfo: {},
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },

  // Error states
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5,
  },
  errorHint: {
    fontSize: 13,
    color: '#9CA3AF',
  },
})
