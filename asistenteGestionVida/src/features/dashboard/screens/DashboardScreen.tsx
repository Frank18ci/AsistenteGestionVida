import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
//import { getExchangeRate } from '../../../services/currencyService';
//import { getWeather } from '../../../services/weatherService';

export default function DashboardScreen() {
  const [weather, setWeather] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
     // const weatherData = await getWeather();
     // const rateData = await getExchangeRate();
      
      //setWeather(weatherData);
      //setExchangeRate(rateData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2f95dc" />
        <Text>Cargando información del día...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Hola, Usuario 👋</Text>
      
      {/* Tarjeta de Clima */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Clima Actual</Text>
        {weather ? (
          <View>
            <Text style={styles.bigText}>{Math.round(weather.temp)}°C</Text>
            <Text style={styles.subText}>{weather.description}</Text>
            <Text style={styles.cityText}>📍 {weather.city}</Text>
          </View>
        ) : (
          <Text>No se pudo cargar el clima.</Text>
        )}
      </View>

      {/* Tarjeta de Finanzas Globales */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Economía</Text>
        <Text style={styles.label}>Tipo de Cambio (USD a PEN):</Text>
        <Text style={styles.bigText}>S/ {exchangeRate?.toFixed(3)}</Text>
      </View>

      {/* Resumen General (Placeholder para conectar con otros módulos) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen del día</Text>
        <Text style={{ color: 'gray' }}>Aquí mostraremos tareas pendientes y saldo actual próximamente.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10, color: '#444' },
  bigText: { fontSize: 32, fontWeight: 'bold', color: '#2f95dc' },
  subText: { fontSize: 16, textTransform: 'capitalize', color: '#666' },
  cityText: { marginTop: 5, fontStyle: 'italic', color: '#888' },
  label: { fontSize: 14, color: '#666' },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});