import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const COLORS = {
  deepCrimson: '#4A0E17',
  darkBurgundy: '#2A080C',
  gold: '#D4AF37',
  white: '#FFFFFF',
  gray: '#A3A3A3',
  translucentWhite: 'rgba(255,255,255,0.07)',
  softWhiteBorder: 'rgba(255,255,255,0.12)',
  translucentBlack: 'rgba(0,0,0,0.2)',
};

const LOCATION_NAME = 'Nasugbu Batangas, PH';
const LOCATION_LAT = 14.07; 
const LOCATION_LON = 120.63; 

type WeatherData = {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
};

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 57) return 'Drizzle';
  if (code >= 61 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95 && code <= 99) return 'Thunderstorm';
  return 'Partly Cloudy';
}

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const fetchWeatherRef = useRef<() => void>(() => {});

 
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

 
  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      try {
        setLoadingWeather(true);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LOCATION_LAT}&longitude=${LOCATION_LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto`
        );
        const data = await response.json();
        if (isMounted && data?.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            condition: getWeatherCondition(data.current.weather_code),
            humidity: Math.round(data.current.relative_humidity_2m),
            wind: Math.round(data.current.wind_speed_10m),
          });
        }
      } catch (error) {
        console.warn('Failed to fetch weather:', error);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    }

    fetchWeatherRef.current = fetchWeather;
    fetchWeather();
    const refreshInterval = setInterval(fetchWeather,  1 * 60 * 1000); 

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchWeatherRef.current();
      }
    });

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      appStateSubscription.remove();
    };
  }, []);

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.deepCrimson, COLORS.darkBurgundy]}
        style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          {}
          <View style={styles.locationPill}>
            <Ionicons name="location" size={16} color={COLORS.gold} />
            <Text style={styles.locationText}>{LOCATION_NAME}</Text>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Current time card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="time-outline" size={16} color={COLORS.gold} />
                <Text style={styles.cardLabel}>Current Time</Text>
              </View>
              <Text style={styles.timeText}>{timeStr}</Text>
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.gray} />
                <Text style={styles.dateText}>{dateStr}</Text>
              </View>
            </View>

            {}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="partly-sunny-outline" size={16} color={COLORS.gold} />
                <Text style={styles.cardLabel}>Weather Updates</Text>
              </View>

              {loadingWeather ? (
                <ActivityIndicator
                  color={COLORS.gold}
                  style={styles.weatherLoading}
                />
              ) : weather ? (
                <>
                  <Text style={styles.tempText}>{weather.temp}°C</Text>
                  <Text style={styles.conditionText}>{weather.condition}</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Humidity</Text>
                      <Text style={styles.statValue}>{weather.humidity}%</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Wind</Text>
                      <Text style={styles.statValue}>{weather.wind} km/h</Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.conditionText}>Unable to load weather</Text>
              )}
            </View>

            {}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="react" size={16} color={COLORS.gold} />
                <Text style={styles.cardLabel}>React Native</Text>
              </View>
              <Text style={styles.brandText}>SIR MAGS</Text>
            </View>
          </ScrollView>

          {}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <MaterialCommunityIcons name="react" size={9} color={COLORS.gray} />
              <Text style={styles.footerText}>React Native · Live Monitors</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },

  locationPill: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.translucentWhite,
    borderWidth: 1,
    borderColor: COLORS.softWhiteBorder,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: COLORS.translucentWhite,
    borderWidth: 1,
    borderColor: COLORS.softWhiteBorder,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardLabel: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  timeText: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '800',
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: COLORS.gray,
    fontSize: 13,
  },

  weatherLoading: {
    marginVertical: 28,
  },
  tempText: {
    color: COLORS.white,
    fontSize: 44,
    fontWeight: '800',
  },
  conditionText: {
    color: COLORS.gray,
    fontSize: 15,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.translucentBlack,
    borderRadius: 16,
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.softWhiteBorder,
  },

  brandText: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 4,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: 12,
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: COLORS.gray,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});