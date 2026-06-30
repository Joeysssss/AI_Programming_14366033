/// <reference types="@types/google.maps" />
import { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useStore } from '../store/useStore';

export function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const { routeQuery } = useStore();
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize instances when library loads
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // Use directions service
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !routeQuery) return;

    directionsService
      .route({
        origin: routeQuery.origin,
        destination: routeQuery.destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response: google.maps.DirectionsResult) => {
        directionsRenderer.setDirections(response);
      })
      .catch((e: Error) => {
        console.error('Directions request failed due to ' + e);
        alert('導航路線規劃失敗，請確認起終點是否正確（例如輸入完整的台北地標）。');
      });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, routeQuery]);

  return null;
}
