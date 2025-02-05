import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useState } from "react";

interface GoogleMapsPickerProps {
  onChange: (location: string) => void;
}

function GoogleMapsPicker({ onChange }: GoogleMapsPickerProps) {
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };
  const [center, setCenter] = useState(defaultCenter);

  const handleCenterChanged = (map: google.maps.Map) => {
    const newCenter = map.getCenter();
    if (!newCenter) return;

    const lat = newCenter.lat();
    const lng = newCenter.lng();

    setCenter({ lat, lng });

    onChange?.(`${lat}, ${lng}`);
  };

  return (
    <div className="h-60 w-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={10}
          gestureHandling="greedy"
          disableDefaultUI={true}
          className="h-full w-full"
          onDrag={(e) => handleCenterChanged(e.map)}
        >
          <Marker position={center} draggable={false} />
        </Map>
      </APIProvider>
    </div>
  );
}

export default GoogleMapsPicker;
