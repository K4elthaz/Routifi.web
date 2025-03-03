import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

interface GoogleMapsViewerProps {
  value: {
    coordinates: [number, number];
  };
}

function GoogleMapsViewer({ value }: GoogleMapsViewerProps) {
  const defaultCenter = {
    lat: value.coordinates[0],
    lng: value.coordinates[1],
  };

  return (
    <div className="h-60 w-full">
      <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={10}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
          draggable={false}
        >
          <Marker position={defaultCenter} draggable={false} />
        </Map>
      </APIProvider>
    </div>
  );
}

export default GoogleMapsViewer;
