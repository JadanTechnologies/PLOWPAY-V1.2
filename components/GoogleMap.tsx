import React, { useEffect, useRef } from 'react';
import { Truck, Shipment, Branch, Tenant, Staff } from '../types';

// SVG strings for markers
const truckIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="{COLOR}" class="w-8 h-8"><path d="M21.99 8.01c0-1.1-.9-2-2-2h-3V4.5c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v1.5H6c-1.1 0-2 .9-2 2v10.5h1.5v.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-.5h6v.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5v-.5H22l-.01-10.49zM12 4.5h4v1.5h-4V4.5zM8 19c-.83 0-1.5-.67-1.5-1.5S7.17 16 8 16s1.5.67 1.5 1.5S8.83 19 8 19zm8 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5zM6 14.5V8h14v6.5H6z"/></svg>`;
const branchIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" class="w-8 h-8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="{COLOR}" class="w-8 h-8"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;


interface MapProps {
    trucks?: Truck[];
    shipments?: Shipment[];
    branches?: Branch[];
    users?: (Tenant | Staff)[];
    onClick?: (latlng: { lat: number, lng: number }) => void;
    editableBranch?: { branch: Branch; onPositionChange: (latlng: { lat: number, lng: number }) => void; };
}

const MapComponent: React.FC<MapProps> = ({ trucks = [], shipments = [], branches = [], users = [], onClick, editableBranch }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Map<string, any>>(new Map());
    const polylinesRef = useRef<Map<string, any>>(new Map());

    useEffect(() => {
        if (mapRef.current && !mapInstance.current && typeof L !== 'undefined') {
            mapInstance.current = L.map(mapRef.current, {
                center: [39.8283, -98.5795],
                zoom: 4,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance.current);

            if(onClick) {
                mapInstance.current.on('click', (e: any) => {
                    onClick(e.latlng);
                });
            }
        }
    }, [onClick]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        const currentMarkers = markersRef.current;
        const allItemIds = new Set([
            ...trucks.map(t => `truck-${t.id}`),
            ...branches.map(b => `branch-${b.id}`),
            ...users.map(u => `${'planId' in u ? 'tenant' : 'staff'}-${u.id}`),
            ...(editableBranch ? [`branch-${editableBranch.branch.id}`] : [])
        ]);

        // Remove old markers
        currentMarkers.forEach((marker, id) => {
            if (!allItemIds.has(id)) {
                map.removeLayer(marker);
                currentMarkers.delete(id);
            }
        });

        const bounds = L.latLngBounds([]);

        // Truck markers
        trucks.forEach(truck => {
            const position: [number, number] = [truck.currentLocation.lat, truck.currentLocation.lng];
            const markerId = `truck-${truck.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);

            const iconColor = truck.status === 'IN_TRANSIT' ? '#22d3ee' : '#64748b';
            const icon = L.divIcon({
                html: truckIconSvg.replace('{COLOR}', iconColor),
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            if (existingMarker) {
                existingMarker.setLatLng(position).setIcon(icon);
            } else {
                const newMarker = L.marker(position, { icon }).addTo(map);
                newMarker.bindTooltip(`<b>${truck.licensePlate}</b><br>Driver: ${truck.driverName}<br>Status: ${truck.status}`);
                currentMarkers.set(markerId, newMarker);
            }
        });

        // Branch markers
        branches.forEach(branch => {
            if (editableBranch && branch.id === editableBranch.branch.id) return; // Skip if it's the editable one
            if (branch.location.lat === 0 && branch.location.lng === 0) return;
            
            const position: [number, number] = [branch.location.lat, branch.location.lng];
            const markerId = `branch-${branch.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);
            
            const icon = L.divIcon({ html: branchIconSvg, className: '', iconSize: [32, 32], iconAnchor: [16, 32] });
            
            if (existingMarker) {
                existingMarker.setLatLng(position);
            } else {
                const newMarker = L.marker(position, { icon }).addTo(map);
                newMarker.bindTooltip(`<b>${branch.name}</b>`);
                currentMarkers.set(markerId, newMarker);
            }
        });
        
        // Editable branch marker
        if (editableBranch) {
            const branch = editableBranch.branch;
            const position: [number, number] = [branch.location.lat, branch.location.lng];
            const markerId = `branch-${branch.id}`;
             if(branch.location.lat !== 0 || branch.location.lng !== 0) {
                bounds.extend(position);
             }

            const icon = L.divIcon({ html: branchIconSvg, className: '', iconSize: [32, 32], iconAnchor: [16, 32] });
            const existingMarker = currentMarkers.get(markerId);

            if (existingMarker) {
                existingMarker.setLatLng(position);
            } else {
                const newMarker = L.marker(position, { icon, draggable: true }).addTo(map);
                newMarker.on('dragend', function(event: any){
                    var marker = event.target;
                    var newPosition = marker.getLatLng();
                    editableBranch.onPositionChange(newPosition);
                });
                currentMarkers.set(markerId, newMarker);
            }
        }
        
        // User markers
        users.forEach(user => {
            if (!user.lastKnownLocation) return;
            
            const position: [number, number] = [user.lastKnownLocation.lat, user.lastKnownLocation.lng];
            const isTenant = 'planId' in user;
            const markerId = `${isTenant ? 'tenant' : 'staff'}-${user.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);

            const iconColor = isTenant ? '#a855f7' : '#ec4899'; // Purple for Tenant, Pink for Staff
            const icon = L.divIcon({
                html: userIconSvg.replace('{COLOR}', iconColor),
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });
            
            const lastUpdated = new Date(user.lastKnownLocation.timestamp).toLocaleString();
            // FIX: Use `ownerName` for Tenant and `name` for Staff, as `name` does not exist on the Tenant type.
            const tooltipContent = `<b>${isTenant ? user.ownerName : user.name}</b> (${isTenant ? 'Admin' : 'Staff'})<br>Last seen: ${lastUpdated}`;

            if (existingMarker) {
                existingMarker.setLatLng(position).setIcon(icon).setTooltipContent(tooltipContent);
            } else {
                const newMarker = L.marker(position, { icon }).addTo(map);
                newMarker.bindTooltip(tooltipContent);
                currentMarkers.set(markerId, newMarker);
            }
        });


        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [trucks, branches, shipments, editableBranch, users]);

    // Polylines...
     useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        const currentPolylines = polylinesRef.current;
        const inTransitShipmentIds = new Set(shipments.filter(s => s.status === 'IN_TRANSIT').map(s => s.id));

        currentPolylines.forEach((line, shipmentId) => {
            if (!inTransitShipmentIds.has(shipmentId)) {
                map.removeLayer(line);
                currentPolylines.delete(shipmentId);
            }
        });

        shipments.forEach(shipment => {
            if (shipment.status === 'IN_TRANSIT') {
                const truck = trucks.find(t => t.id === shipment.truckId);
                const branch = branches.find(b => b.id === shipment.destination);
                if (truck && branch?.location && (branch.location.lat !== 0 || branch.location.lng !== 0)) {
                    const path = [ [truck.currentLocation.lat, truck.currentLocation.lng], [branch.location.lat, branch.location.lng] ];
                    
                    const existingPolyline = currentPolylines.get(shipment.id);

                    if (existingPolyline) {
                        existingPolyline.setLatLngs(path);
                    } else {
                        const newPolyline = L.polyline(path, { color: '#06b6d4', weight: 2, dashArray: '5, 5' }).addTo(map);
                        currentPolylines.set(shipment.id, newPolyline);
                    }
                }
            }
        });

    }, [shipments, trucks, branches]);


    return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
};

export default MapComponent;