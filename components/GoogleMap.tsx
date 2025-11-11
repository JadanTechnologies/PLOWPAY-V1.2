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
        
        // User markers (tenants and staff)
        users.forEach(user => {
            if (!user.lastKnownLocation) return;
            const position: [number, number] = [user.lastKnownLocation.lat, user.lastKnownLocation.lng];
            const isTenant = 'planId' in user;
            const markerId = `${isTenant ? 'tenant' : 'staff'}-${user.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);
            
            const iconColor = isTenant ? '#a78bfa' : '#60a5fa'; // purple for tenant, blue for staff
            const icon = L.divIcon({ 
                html: userIconSvg.replace('{COLOR}', iconColor), 
                className: '', 
                iconSize: [32, 32], 
                iconAnchor: [16, 32] 
            });

            if(existingMarker) {
                existingMarker.setLatLng(position);
            } else {
                const name = isTenant ? (user as Tenant).businessName : (user as Staff).name;
                const newMarker = L.marker(position, { icon }).addTo(map);
                newMarker.bindTooltip(`<b>${name}</b><br>${isTenant ? 'Tenant' : 'Staff'}`);
                currentMarkers.set(markerId, newMarker);
            }
        });


        // Editable branch marker
        if (editableBranch) {
            const { branch, onPositionChange } = editableBranch;
            const position: [number, number] = [branch.location.lat, branch.location.lng];
            const markerId = `branch-${branch.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);
            const icon = L.divIcon({ html: branchIconSvg, className: 'blinking-marker', iconSize: [32, 32], iconAnchor: [16, 32] });

            if (existingMarker) {
                existingMarker.setLatLng(position);
            } else {
                const newMarker = L.marker(position, { icon, draggable: true }).addTo(map);
                newMarker.on('dragend', function (event: any) {
                    onPositionChange(event.target.getLatLng());
                });
                newMarker.bindTooltip(`<b>${branch.name}</b><br>Drag to set location`);
                currentMarkers.set(markerId, newMarker);
            }
        }
        
        // Shipment polylines
        const currentPolylines = polylinesRef.current;
        const allShipmentIds = new Set(shipments.map(s => `shipment-${s.id}`));

        // Remove old polylines
        currentPolylines.forEach((line, id) => {
            if (!allShipmentIds.has(id)) {
                map.removeLayer(line);
                currentPolylines.delete(id);
            }
        });

        shipments.forEach(shipment => {
            if (shipment.status !== 'IN_TRANSIT') return;

            const truck = trucks.find(t => t.id === shipment.truckId);
            const destinationBranch = branches.find(b => b.id === shipment.destination);
            
            if (truck && destinationBranch) {
                const start: [number, number] = [truck.currentLocation.lat, truck.currentLocation.lng];
                const end: [number, number] = [destinationBranch.location.lat, destinationBranch.location.lng];
                
                const lineId = `shipment-${shipment.id}`;
                const existingLine = currentPolylines.get(lineId);

                if (existingLine) {
                    existingLine.setLatLngs([start, end]);
                } else {
                    const polyline = L.polyline([start, end], {
                        color: '#6366f1',
                        weight: 2,
                        opacity: 0.7,
                        dashArray: '5, 5'
                    }).addTo(map);
                    polyline.bindTooltip(`Shipment: ${shipment.shipmentCode}`);
                    currentPolylines.set(lineId, polyline);
                }
            }
        });


        // Fit bounds if there are items to show
        if (bounds.isValid() && !editableBranch) { // Don't auto-zoom when editing a branch location
             map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [trucks, branches, users, shipments, editableBranch]);

    // FIX: A React functional component must return a renderable element. This div serves as the map container.
    return <div ref={mapRef} className="w-full h-full" />;
};

export default MapComponent;
