import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (color = '#3b82f6') => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 30px;
          height: 30px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          animation: marker-pulse 2s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: ${color}30;
          border-radius: 50%;
          animation: marker-pulse 2s ease-in-out infinite;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Map controller component
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

const LiveMapComponent = ({ 
  locations = [], 
  currentLocation = null, 
  height = '500px',
  showControls = true,
}) => {
  const [mapTheme, setMapTheme] = useState('light');
  const [center, setCenter] = useState([51.505, -0.09]);
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (currentLocation) {
      setCenter([currentLocation.latitude, currentLocation.longitude]);
      setZoom(15);
    } else if (locations.length > 0) {
      const firstLocation = locations[0];
      setCenter([firstLocation.latitude, firstLocation.longitude]);
    }
  }, [currentLocation, locations]);

  const tileLayerUrl = mapTheme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={tileLayerUrl}
        />

        <MapController center={center} zoom={zoom} />

        {/* Current Location */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={createCustomIcon('#10b981')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold mb-1">📍 Your Location</h3>
                <p className="text-sm text-gray-600">
                  Lat: {currentLocation.latitude.toFixed(6)}
                  <br />
                  Lng: {currentLocation.longitude.toFixed(6)}
                </p>
                {currentLocation.accuracy && (
                  <p className="text-xs text-gray-500 mt-1">
                    Accuracy: {Math.round(currentLocation.accuracy)}m
                  </p>
                )}
                {currentLocation.speed !== null && currentLocation.speed > 0 && (
                  <p className="text-xs text-gray-500">
                    Speed: {(currentLocation.speed * 3.6).toFixed(1)} km/h
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Other Users' Locations */}
        {locations.map((item, index) => (
          <Marker
            key={item.location.id || index}
            position={[item.location.latitude, item.location.longitude]}
            icon={createCustomIcon('#3b82f6')}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  {item.user.avatar ? (
                    <img
                      src={item.user.avatar}
                      alt={item.user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {item.user.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{item.user.name}</h3>
                    <p className="text-xs text-gray-500">{item.user.email}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Lat: {item.location.latitude.toFixed(6)}
                  <br />
                  Lng: {item.location.longitude.toFixed(6)}
                </p>
                {item.location.speed !== null && item.location.speed > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Speed: {(item.location.speed * 3.6).toFixed(1)} km/h
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-10 flex gap-2"
        >
          <button
            onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
            className="px-4 py-2 glass rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            {mapTheme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          
          {currentLocation && (
            <button
              onClick={() => {
                setCenter([currentLocation.latitude, currentLocation.longitude]);
                setZoom(15);
              }}
              className="px-4 py-2 glass rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              📍 Center
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default LiveMapComponent;