import React, { useEffect, useRef, useState } from 'react';
import { Truck } from '../types';

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const GoogleMap: React.FC<{ trucks: Truck[] }> = ({ trucks }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    // Initialize map
    useEffect(() => {
        if (mapRef.current && !map && window.google) {
            const newMap = new google.maps.Map(mapRef.current, {
                center: { lat: 39.8283, lng: -98.5795 }, // Center of US
                zoom: 4,
                styles: mapStyles,
                disableDefaultUI: true,
                zoomControl: true,
                backgroundColor: '#242f3e'
            });
            setMap(newMap);
            infoWindowRef.current = new google.maps.InfoWindow();
        }
    }, [map]);

    // Update markers
    useEffect(() => {
        if (map) {
            const currentMarkers = markersRef.current;
            const truckIds = new Set(trucks.map(t => t.id));

            // Remove old markers
            currentMarkers.forEach((marker, truckId) => {
                if (!truckIds.has(truckId)) {
                    marker.setMap(null);
                    currentMarkers.delete(truckId);
                }
            });

            // Add/update markers
            trucks.forEach(truck => {
                const position = { lat: truck.currentLocation.lat, lng: truck.currentLocation.lng };
                const existingMarker = currentMarkers.get(truck.id);

                if (existingMarker) {
                    existingMarker.setPosition(position);
                } else {
                    const iconColor = truck.status === 'IN_TRANSIT' ? '#22d3ee' : '#64748b';
                    const newMarker = new google.maps.Marker({
                        position,
                        map,
                        title: truck.licensePlate,
                        icon: {
                            path: 'M21.99 8.01c0-1.1-.9-2-2-2h-3V4.5c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v1.5H6c-1.1 0-2 .9-2 2v10.5h1.5v.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-.5h6v.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-.5H22l-.01-10.49zM12 4.5h4v1.5h-4V4.5zM8 19c-.83 0-1.5-.67-1.5-1.5S7.17 16 8 16s1.5.67 1.5 1.5S8.83 19 8 19zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM6 14.5V8h14v6.5H6z',
                            fillColor: iconColor,
                            fillOpacity: 1,
                            strokeWeight: 0,
                            rotation: 0,
                            scale: 1.2,
                            anchor: new google.maps.Point(12, 12),
                        },
                    });

                    const infoWindowContent = `
                        <div style="color: black; font-family: sans-serif; padding: 5px; max-width: 200px;">
                            <h4 style="font-weight: bold; margin: 0 0 5px; color: #0f172a">${truck.licensePlate}</h4>
                            <p style="margin: 0; color: #334155;">Driver: ${truck.driverName}</p>
                            <p style="margin: 0; color: #334155;">Load: ${(truck.currentLoad / 1000).toFixed(1)}t / ${(truck.maxLoad / 1000).toFixed(1)}t</p>
                            <p style="margin: 0; color: #334155;">Status: ${truck.status}</p>
                        </div>
                    `;

                    newMarker.addListener('mouseover', () => {
                        infoWindowRef.current?.setContent(infoWindowContent);
                        infoWindowRef.current?.open(map, newMarker);
                    });
                    newMarker.addListener('mouseout', () => {
                        infoWindowRef.current?.close();
                    });

                    currentMarkers.set(truck.id, newMarker);
                }
            });
        }
    }, [map, trucks]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMap;
