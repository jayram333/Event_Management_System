import React, { useState, useEffect, useRef } from 'react';
import { IconMapPin, IconSearch } from './Icons';

export const MapPicker = ({ location, onChange, label = 'Select Venue / Location on Map' }) => {
  const [address, setAddress] = useState(location?.address || '');
  const [lat, setLat] = useState(location?.latitude || 17.6868); // Default Visakhapatnam coords
  const [lng, setLng] = useState(location?.longitude || 83.2185);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  useEffect(() => {
    if (location) {
      if (location.address !== undefined) setAddress(location.address);
      if (location.latitude && location.longitude) {
        const newLat = Number(location.latitude);
        const newLng = Number(location.longitude);
        setLat(newLat);
        setLng(newLng);

        if (markerInstance.current) {
          markerInstance.current.setLatLng([newLat, newLng]);
        }
        if (mapInstance.current) {
          mapInstance.current.setView([newLat, newLng], 13);
        }
      }
    }
  }, [location?.latitude, location?.longitude, location?.address]);

  useEffect(() => {
    let isMounted = true;

    const loadLeaflet = () => {
      return new Promise((resolve) => {
        if (window.L) return resolve(window.L);
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        document.head.appendChild(script);
      });
    };

    loadLeaflet().then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstance.current) {
        const initialLat = location?.latitude ? Number(location.latitude) : 17.6868;
        const initialLng = location?.longitude ? Number(location.longitude) : 83.2185;

        const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap',
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);

        const handlePositionUpdate = async (newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
          marker.setLatLng([newLat, newLng]);

          // Reverse geocoding via Nominatim
          let newAddress = address;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`);
            const data = await res.json();
            if (data && data.display_name) {
              newAddress = data.display_name;
              setAddress(newAddress);
            }
          } catch (err) {
            console.error('Reverse geocode error:', err);
          }

          if (onChange) {
            onChange({
              address: newAddress,
              latitude: newLat,
              longitude: newLng,
            });
          }
        };

        map.on('click', (e) => {
          handlePositionUpdate(e.latlng.lat, e.latlng.lng);
        });

        marker.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          handlePositionUpdate(pos.lat, pos.lng);
        });

        mapInstance.current = map;
        markerInstance.current = marker;

        setTimeout(() => {
          if (mapInstance.current) mapInstance.current.invalidateSize();
        }, 300);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      } else {
        setSearchError('Location not found. Try another search.');
      }
    } catch (err) {
      console.error('Nominatim search error:', err);
      setSearchError('Location not found. Try another search.');
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (place) => {
    const selectedAddress = place.display_name;
    const selectedLat = parseFloat(place.lat);
    const selectedLng = parseFloat(place.lon);

    setAddress(selectedAddress);
    setLat(selectedLat);
    setLng(selectedLng);
    setSearchResults([]);
    setSearchQuery('');
    setSearchError('');

    if (markerInstance.current) {
      markerInstance.current.setLatLng([selectedLat, selectedLng]);
    }
    if (mapInstance.current) {
      mapInstance.current.setView([selectedLat, selectedLng], 14);
    }

    if (onChange) {
      onChange({
        address: selectedAddress,
        latitude: selectedLat,
        longitude: selectedLng,
      });
    }
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setAddress(val);
    if (onChange) {
      onChange({
        address: val,
        latitude: lat,
        longitude: lng,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</label>

      {/* Address Text Field */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="form-control"
          placeholder="Venue Address / Name"
          value={address}
          onChange={handleAddressChange}
          required
        />
      </div>

      {/* Map Location Search Box */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161e2e', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', width: '100%' }}>
            <IconSearch size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search location on OpenStreetMap (e.g., Visakhapatnam)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchError) setSearchError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
            />
          </div>
          <button type="button" onClick={handleSearch} className="secondary-btn" style={{ padding: '8px 14px', fontSize: '0.85rem' }} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchError && (
          <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#f43f5e' }}>
            {searchError}
          </div>
        )}

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#1f2937',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 100,
              boxShadow: 'var(--shadow-lg)',
              marginTop: '4px',
            }}
          >
            {searchResults.map((place, idx) => (
              <div
                key={idx}
                onClick={() => selectPlace(place)}
                style={{
                  padding: '10px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  fontSize: '0.825rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <IconMapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{place.display_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Leaflet Map */}
      <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', height: '220px', position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(17,24,39,0.85)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', zIndex: 10 }}>
          Lat: {typeof lat === 'number' ? lat.toFixed(4) : lat}, Lng: {typeof lng === 'number' ? lng.toFixed(4) : lng}
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
