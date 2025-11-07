import React, { useEffect, useRef, useState } from 'react';
import { Truck, Shipment, Branch } from '../types';

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

interface GoogleMapProps {
    trucks?: Truck[];
    shipments?: Shipment[];
    branches?: Branch[];
}

const GoogleMap: React.FC<GoogleMapProps> = ({ trucks = [], shipments = [], branches = [] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
    const polylinesRef = useRef<Map<string, google.maps.Polyline>>(new Map());
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

    // Update markers and fit bounds
    useEffect(() => {
        if (map) {
            const currentMarkers = markersRef.current;
            const allItemIds = new Set([
                ...trucks.map(t => `truck-${t.id}`),
                ...branches.map(b => `branch-${b.id}`)
            ]);

            // Remove old markers
            currentMarkers.forEach((marker, id) => {
                if (!allItemIds.has(id)) {
                    marker.setMap(null);
                    currentMarkers.delete(id);
                }
            });
            
            const bounds = new window.google.maps.LatLngBounds();

            // Truck markers
            trucks.forEach(truck => {
                const position = { lat: truck.currentLocation.lat, lng: truck.currentLocation.lng };
                const markerId = `truck-${truck.id}`;
                bounds.extend(position);
                const existingMarker = currentMarkers.get(markerId);

                if (existingMarker) {
                    existingMarker.setPosition(position);
                } else {
                    const iconColor = truck.status === 'IN_TRANSIT' ? '#22d3ee' : '#64748b';
                    const newMarker = new google.maps.Marker({
                        position, map, title: truck.licensePlate,
                        icon: { path: 'M21.99 8.01c0-1.1-.9-2-2-2h-3V4.5c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v1.5H6c-1.1 0-2 .9-2 2v10.5h1.5v.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-.5h6v.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-.5H22l-.01-10.49zM12 4.5h4v1.5h-4V4.5zM8 19c-.83 0-1.5-.67-1.5-1.5S7.17 16 8 16s1.5.67 1.5 1.5S8.83 19 8 19zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM6 14.5V8h14v6.5H6z', fillColor: iconColor, fillOpacity: 1, strokeWeight: 0, rotation: 0, scale: 1.2, anchor: new google.maps.Point(12, 12) },
                    });
                    
                    const infoWindowContent = `<div style="color: #0f172a; font-family: sans-serif; padding: 5px;"><h4 style="font-weight: bold; margin: 0 0 5px;">${truck.licensePlate}</h4><p style="margin: 0;">Driver: ${truck.driverName}</p><p style="margin: 0;">Status: ${truck.status}</p></div>`;
                    newMarker.addListener('mouseover', () => { infoWindowRef.current?.setContent(infoWindowContent); infoWindowRef.current?.open(map, newMarker); });
                    newMarker.addListener('mouseout', () => { infoWindowRef.current?.close(); });
                    currentMarkers.set(markerId, newMarker);
                }
            });

            // Branch markers
            branches.forEach(branch => {
                const position = branch.location;
                if(position.lat === 0 && position.lng === 0) return; // Don't show un-located branches
                
                const markerId = `branch-${branch.id}`;
                bounds.extend(position);
                const existingMarker = currentMarkers.get(markerId);
                
                if (existingMarker) {
                    existingMarker.setPosition(position);
                } else {
                    const newMarker = new google.maps.Marker({
                        position, map, title: branch.name,
                        icon: { path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z', fillColor: '#f59e0b', fillOpacity: 1, strokeWeight: 0, scale: 1.5, anchor: new google.maps.Point(12, 24) },
                    });
                    const infoWindowContent = `<div style="color: #0f172a; font-family: sans-serif; padding: 5px;"><h4 style="font-weight: bold; margin: 0;">${branch.name}</h4></div>`;
                    newMarker.addListener('mouseover', () => { infoWindowRef.current?.setContent(infoWindowContent); infoWindowRef.current?.open(map, newMarker); });
                    newMarker.addListener('mouseout', () => { infoWindowRef.current?.close(); });
                    currentMarkers.set(markerId, newMarker);
                }
            });
            
            if (!bounds.isEmpty()) {
                map.fitBounds(bounds);
            }
        }
    }, [map, trucks, branches]);

    // Update Polylines for shipments
    useEffect(() => {
        if (map) {
            const currentPolylines = polylinesRef.current;
            const inTransitShipmentIds = new Set(shipments.filter(s => s.status === 'IN_TRANSIT').map(s => s.id));

            // Remove old polylines
            currentPolylines.forEach((line, shipmentId) => {
                if (!inTransitShipmentIds.has(shipmentId)) {
                    line.setMap(null);
                    currentPolylines.delete(shipmentId);
                }
            });

            // Add/update polylines for in-transit shipments
            shipments.forEach(shipment => {
                if (shipment.status === 'IN_TRANSIT') {
                    const truck = trucks.find(t => t.id === shipment.truckId);
                    const branch = branches.find(b => b.id === shipment.destination);

                    if (truck && branch?.location) {
                        const path = [truck.currentLocation, branch.location];
                        const existingPolyline = currentPolylines.get(shipment.id);

                        if (existingPolyline) {
                            existingPolyline.setPath(path);
                        } else {
                            const lineSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 };
                            const newPolyline = new window.google.maps.Polyline({
                                path, geodesic: true, strokeColor: '#06b6d4', strokeOpacity: 0, strokeWeight: 2,
                                icons: [{ icon: lineSymbol, offset: '0', repeat: '20px' }],
                            });
                            newPolyline.setMap(map);
                            currentPolylines.set(shipment.id, newPolyline);
                        }
                    }
                }
            });
        }
    }, [map, shipments, trucks, branches]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default GoogleMap;