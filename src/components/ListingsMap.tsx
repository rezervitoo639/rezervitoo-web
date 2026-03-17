import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/i18n/LanguageContext";

interface MapListing { 
  id: string | number; 
  title: string; 
  price: number | string; 
  location_text?: string; 
  cover_image: string; 
  location_lat?: number; 
  location_lng?: number; 
}
interface ListingsMapProps { listings: MapListing[]; }

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const ListingsMap = ({ listings }: ListingsMapProps) => {
  const { t } = useLanguage();
  
  // Only use listings with coordinates for centering
  const validListings = listings.filter(l => l.location_lat && l.location_lng);
  
  const center = validListings.length > 0
    ? [
        validListings.reduce((s, l) => s + (l.location_lat || 0), 0) / validListings.length, 
        validListings.reduce((s, l) => s + (l.location_lng || 0), 0) / validListings.length
      ] as [number, number]
    : [36.75, 3.06] as [number, number];

  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border min-h-[600px]">
      <MapContainer center={center} zoom={6} className="h-full w-full" scrollWheelZoom>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {listings.map((listing) => (
          listing.location_lat && listing.location_lng && (
            <Marker key={listing.id} position={[listing.location_lat, listing.location_lng]} icon={customIcon}>
              <Popup>
                <Link to={`/listing/${listing.id}`} className="block w-48">
                  <img src={listing.cover_image} alt={listing.title} className="h-24 w-full rounded-lg object-cover" />
                  <p className="mt-2 text-sm font-semibold">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listing.location_text}</p>
                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {typeof listing.price === "string" ? parseFloat(listing.price).toLocaleString() : listing.price.toLocaleString()} {t("map.daNight")}
                  </p>
                </Link>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default ListingsMap;
