import { useState, useEffect, useCallback } from 'react';

export interface WeatherData {
  temperature: string;
  weatherCondition: string;
  humidity: string;
  windSpeed: string;
  feelsLike: string;
  pressure: string;
  uvIndex: string;
  visibility: string;
  rainChance: string;
}

export interface BatangasCity {
  name: string;
  latitude: number;
  longitude: number;
}

const BATANGAS_CITIES: BatangasCity[] = [
  { name: 'Nasugbu', latitude: 13.7941, longitude: 120.6194 },
  { name: 'Tuy', latitude: 13.8869, longitude: 120.8894 },
  { name: 'Calatagan', latitude: 14.1058, longitude: 120.8519 },
  { name: 'Lemery', latitude: 13.9775, longitude: 120.8297 },
  { name: 'Mabini', latitude: 13.8233, longitude: 120.8694 },
  { name: 'Santa Teresita', latitude: 14.0547, longitude: 120.9275 },
  { name: 'Anilao', latitude: 13.8094, longitude: 120.8569 },
  { name: 'Batangas City', latitude: 13.7563, longitude: 121.1897 },
  { name: 'Lian', latitude: 13.9306, longitude: 120.7483 },
  { name: 'Santo Tomas', latitude: 13.9953, longitude: 121.3156 },
  { name: 'Tanauan', latitude: 13.9514, longitude: 121.3675 },
  { name: 'Alitagtag', latitude: 14.0944, longitude: 121.3814 },
];

function getWeatherLabel(code: number): string {
  const weatherCodes: { [key: number]: string } = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Heavy Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Heavy Freezing Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Slight Showers',
    81: 'Moderate Showers',
    82: 'Violent Showers',
    85: 'Slight Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Heavy Hail',
  };
  return weatherCodes[code] || 'Partly Cloudy';
}

export function useBatangasWeather(city: BatangasCity | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,pressure_msl,uv_index,visibility,precipitation_probability&timezone=Asia/Manila`
      );

      if (!response.ok) throw new Error('Failed to fetch weather data');

      const data = await response.json();
      const current = data.current;

      if (current) {
        setWeather({
          temperature: `${Math.round(current.temperature_2m)}°C`,
          weatherCondition: getWeatherLabel(current.weather_code),
          humidity: `${Math.round(current.relative_humidity_2m)}%`,
          windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
          feelsLike: `${Math.round(current.apparent_temperature)}°C`,
          pressure: `${Math.round(current.pressure_msl)} hPa`,
          uvIndex: `${current.uv_index}`,
          visibility: `${Math.round(current.visibility / 1000)} km`,
          rainChance: `${Math.round(current.precipitation_probability)}%`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();

    // Refresh weather every 5 minutes for real-time updates
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchWeather]);

  return { weather, loading, error, refetch: fetchWeather };
}

export function useBatangasCities() {
  return BATANGAS_CITIES;
}

export function getBatangasCity(name: string): BatangasCity | undefined {
  return BATANGAS_CITIES.find((city) => city.name === name);
}
