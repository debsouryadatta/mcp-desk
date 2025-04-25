import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, Loader2, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
  humidity: number;
  wind: number;
  high: number;
  low: number;
}

interface WeatherWidgetProps {
  location?: string;
}

export default function WeatherWidget({ location }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherByLocation = async (locationName: string) => {
    try {
      setLoading(true);
      setError(null);

      const geocodeResponse = await fetch(
        `https://geocode.maps.co/search?q=${encodeURIComponent(locationName)}`
      );

      if (!geocodeResponse.ok) {
        throw new Error('Failed to geocode location');
      }

      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData.length) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeData[0];
      
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      
      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await weatherResponse.json();
      
      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        condition: getCondition(weatherData.current.weather_code),
        location: locationName,
        humidity: weatherData.current.relative_humidity_2m,
        wind: Math.round(weatherData.current.wind_speed_10m * 3.6), // Convert m/s to km/h
        high: Math.round(weatherData.daily.temperature_2m_max[0]),
        low: Math.round(weatherData.daily.temperature_2m_min[0])
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Unable to fetch weather data for this location');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchWeatherByLocation(location);
    } else {
      setLoading(false);
    }
  }, [location]);

  const getCondition = (code: number) => {
    if (code === 0) return 'clear';
    if (code === 1 || code === 2 || code === 3) return 'clouds';
    if (code >= 51 && code <= 57) return 'drizzle';
    if (code >= 61 && code <= 67) return 'rain';
    if (code >= 71 && code <= 77) return 'snow';
    if (code >= 95 && code <= 99) return 'thunderstorm';
    return 'clouds';
  };

  const getWeatherIcon = (condition: string) => {
    const iconProps = { className: "h-12 w-12 transition-all duration-300 group-hover:scale-110" };
    
    switch (condition.toLowerCase()) {
      case 'clear':
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      case 'clouds':
        return <Cloud {...iconProps} className={`${iconProps.className} text-gray-400`} />;
      case 'rain':
        return <CloudRain {...iconProps} className={`${iconProps.className} text-blue-400`} />;
      case 'thunderstorm':
        return <CloudLightning {...iconProps} className={`${iconProps.className} text-purple-400`} />;
      case 'snow':
        return <CloudSnow {...iconProps} className={`${iconProps.className} text-blue-200`} />;
      case 'drizzle':
        return <CloudDrizzle {...iconProps} className={`${iconProps.className} text-blue-300`} />;
      default:
        return <Cloud {...iconProps} className={`${iconProps.className} text-gray-400`} />;
    }
  };

  if (!location) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[160px] text-center">
          <MapPin className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Please set your location in settings to see weather information
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 flex justify-center items-center min-h-[160px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center text-muted-foreground">
          <p className="text-sm">{error || 'Unable to load weather data'}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchWeatherByLocation(location)} 
            className="mt-3"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      <CardContent className="p-5 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground">{weather.location}</div>
              <div className="text-3xl font-bold mt-1 tracking-tight group-hover:text-primary transition-colors">
                {weather.temperature}°C
              </div>
            </div>
            {getWeatherIcon(weather.condition)}
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 rounded-lg p-2 backdrop-blur-md border border-white/10"
            >
              <div className="text-xs text-muted-foreground">Humidity</div>
              <div className="font-medium">{weather.humidity}%</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 rounded-lg p-2 backdrop-blur-md border border-white/10"
            >
              <div className="text-xs text-muted-foreground">Wind</div>
              <div className="font-medium">{weather.wind} km/h</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/5 rounded-lg p-2 backdrop-blur-md border border-white/10"
            >
              <div className="text-xs text-muted-foreground">H/L</div>
              <div className="font-medium">{weather.high}° / {weather.low}°</div>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}