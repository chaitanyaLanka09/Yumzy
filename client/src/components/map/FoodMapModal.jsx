import React, { useEffect, useRef } from 'react';
import { X, MapPin, ExternalLink } from 'lucide-react';
import L from 'leaflet';

export const FoodMapModal = ({ isOpen, onClose, donations = [], center = [17.4156, 78.4357] }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Fix default marker icon assets for Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for donations
    donations.forEach((d) => {
      if (d.coordinates?.lat && d.coordinates?.lng) {
        const marker = L.marker([d.coordinates.lat, d.coordinates.lng]).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px;">
            <b style="color: #16845B; font-size: 13px;">${d.foodName}</b><br/>
            <span style="font-size: 11px; color: #555;">Available: <b>${d.availableQuantity} ${d.unit}</b></span><br/>
            <span style="font-size: 10px; color: #777;">Locality: ${d.pickupLocation?.locality || 'Hyderabad'}</span>
          </div>
        `);
      }
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      // Map stays until modal unmounts
    };
  }, [isOpen, donations]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-5xl 2xl:max-w-6xl w-full h-[82vh] flex flex-col p-6 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#16845B]/10 flex items-center justify-center text-[#16845B]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-gray-900">
                Surplus Food Pickup Locations Map
              </h3>
              <p className="text-xs text-gray-500">
                Interactive geographic distribution across Hyderabad & Telangana
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaflet Container */}
        <div className="flex-1 w-full rounded-2xl overflow-hidden border border-gray-200 relative">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        <div className="pt-3 flex items-center justify-between text-xs text-gray-500">
          <span>Showing {donations.filter((d) => d.coordinates?.lat).length} verified pickup coordinates</span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
