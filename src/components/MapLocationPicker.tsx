import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Navigation, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MapLocationPicker = ({ lat, lng, onChange }: MapLocationPickerProps) => {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current).setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onChange(parseFloat(position.lat.toFixed(6)), parseFloat(position.lng.toFixed(6)));
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChange(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
    });

    leafletMapRef.current = map;
    markerRef.current = marker;

    // Force call invalidateSize to fix rendering bugs in hidden containers
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync marker when lat/lng props change externally
  useEffect(() => {
    if (markerRef.current && leafletMapRef.current) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== lat || currentPos.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        leafletMapRef.current.setView([lat, lng], leafletMapRef.current.getZoom());
      }
    }
  }, [lat, lng]);

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat: newLat, lon: newLng } = data[0];
          const latVal = parseFloat(newLat);
          const lngVal = parseFloat(newLng);
          onChange(latVal, lngVal);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setSearching(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [searchQuery, onChange]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        onChange(position.coords.latitude, position.coords.longitude);
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("filters.searchPlaceholder") || "Search city or address..."}
            className="w-full h-11 pl-10 pr-10 rounded-xl border bg-background text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          className="h-11 w-11 rounded-xl shrink-0" 
          onClick={handleLocateMe}
          title="My Location"
        >
          <Navigation className="h-4 w-4" />
        </Button>
      </div>
      <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border shadow-inner" style={{ height: "350px" }} />
    </div>
  );
};

export default MapLocationPicker;
