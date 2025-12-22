import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  Wind,
  Eye,
  Droplets,
} from 'lucide-react';

interface WeatherData {
  condition: 'clear' | 'cloudy' | 'rain' | 'snow' | 'thunderstorm';
  temperature: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  ceiling: number;
  altimeter: number;
}

// Simulated weather data for demo
function useWeatherData(): WeatherData {
  const [weather, setWeather] = useState<WeatherData>({
    condition: 'cloudy',
    temperature: 45,
    windSpeed: 12,
    windDirection: 270,
    visibility: 10,
    ceiling: 25000,
    altimeter: 30.12,
  });

  useEffect(() => {
    // Simulate weather updates
    const interval = setInterval(() => {
      setWeather(prev => ({
        ...prev,
        windSpeed: Math.max(5, prev.windSpeed + (Math.random() - 0.5) * 3),
        windDirection: (prev.windDirection + (Math.random() - 0.5) * 10 + 360) % 360,
        temperature: prev.temperature + (Math.random() - 0.5) * 2,
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return weather;
}

export function WeatherWidget() {
  const weather = useWeatherData();

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'clear': return Sun;
      case 'cloudy': return Cloud;
      case 'rain': return CloudRain;
      case 'snow': return CloudSnow;
      case 'thunderstorm': return CloudLightning;
      default: return Cloud;
    }
  };

  const WeatherIcon = getWeatherIcon();
  const isMVFR = weather.visibility < 5 || weather.ceiling < 3000;
  const isIFR = weather.visibility < 3 || weather.ceiling < 1000;
  const flightCategory = isIFR ? 'IFR' : isMVFR ? 'MVFR' : 'VFR';
  const categoryColor = isIFR ? '#ff3366' : isMVFR ? '#00d4ff' : '#00ff88';

  return (
    <div className="panel" style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div className="panel-header" style={{ flexShrink: 0 }}>
        <Cloud size={14} />
        <span>WEATHER</span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'Orbitron', monospace",
          fontSize: 9,
          padding: '2px 8px',
          borderRadius: 3,
          background: `${categoryColor}20`,
          border: `1px solid ${categoryColor}50`,
          color: categoryColor,
        }}>
          {flightCategory}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: 12 }}>
        {/* Main weather display */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 12,
        }}>
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <WeatherIcon size={32} style={{ color: '#00d4ff' }} />
          </motion.div>
          <div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 24,
              fontWeight: 600,
              color: '#e6edf3',
            }}>
              {Math.round(weather.temperature)}°F
            </div>
            <div style={{
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: 11,
              color: '#6e7681',
              textTransform: 'capitalize',
            }}>
              {weather.condition}
            </div>
          </div>
        </div>

        {/* Weather details grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}>
          <WeatherDetail
            icon={Wind}
            label="Wind"
            value={`${String(Math.round(weather.windDirection)).padStart(3, '0')}° @ ${Math.round(weather.windSpeed)}kt`}
          />
          <WeatherDetail
            icon={Eye}
            label="Visibility"
            value={`${weather.visibility}+ SM`}
          />
          <WeatherDetail
            icon={Cloud}
            label="Ceiling"
            value={`FL${Math.round(weather.ceiling / 100)}`}
          />
          <WeatherDetail
            icon={Droplets}
            label="Altimeter"
            value={weather.altimeter.toFixed(2)}
          />
        </div>

        {/* METAR-style summary */}
        <div style={{
          marginTop: 12,
          padding: 8,
          background: 'rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 4,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: '#00d4ff',
            wordBreak: 'break-all',
          }}>
            KBOS {new Date().toISOString().slice(5, 16).replace('-', '').replace(':', '').replace('T', '')}Z {String(Math.round(weather.windDirection)).padStart(3, '0')}{String(Math.round(weather.windSpeed)).padStart(2, '0')}KT {weather.visibility}SM SCT{Math.round(weather.ceiling / 100).toString().padStart(3, '0')} A{weather.altimeter.toFixed(2).replace('.', '')}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeatherDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wind;
  label: string;
  value: string;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: 6,
      background: 'rgba(0, 255, 136, 0.03)',
      borderRadius: 4,
    }}>
      <Icon size={12} style={{ color: '#6e7681', flexShrink: 0 }} />
      <div>
        <div style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 9,
          color: '#6e7681',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#e6edf3',
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}
