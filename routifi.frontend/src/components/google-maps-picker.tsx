import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

function GoogleMapsPicker() {
  const defaultCenter = { lat: 37.7749, lng: -122.4194 };

  return (
    <div className="h-60 w-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={10}
          gestureHandling="greedy"
          disableDefaultUI={true}
          className="h-full w-full"
        >
          <Marker position={defaultCenter} draggable={false} />
        </Map>
      </APIProvider>
    </div>
  );
}

export default GoogleMapsPicker;
