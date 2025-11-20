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
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            
            const popupContent = `<b>Truck:</b> ${truck.licensePlate}<br><b>Driver:</b> ${truck.driverName}<br><b>Status:</b> ${truck.status}<br><b>Load:</b> ${(truck.currentLoad / 1000).toFixed(1)}t / ${(truck.maxLoad / 1000).toFixed(1)}t`;

            if (existingMarker) {
                existingMarker.setLatLng(position).setPopupContent(popupContent);
            } else {
                const newMarker = L.marker(position, { icon }).bindPopup(popupContent).addTo(map);
                currentMarkers.set(markerId, newMarker);
            }
        });

        // Branch markers
        branches.forEach(branch => {
            if(branch.location.lat === 0 && branch.location.lng === 0) return; // Don't show un-placed branches

            const position: [number, number] = [branch.location.lat, branch.location.lng];
            const markerId = `branch-${branch.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);

             const icon = L.divIcon({
                html: branchIconSvg,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
            const popupContent = `<b>Branch:</b> ${branch.name}`;

            if (existingMarker) {
                existingMarker.setLatLng(position).setPopupContent(popupContent);
            } else {
                const newMarker = L.marker(position, { icon }).bindPopup(popupContent).addTo(map);
                currentMarkers.set(markerId, newMarker);
            }
        });

        // User markers (Tenant owners and Staff)
        users.forEach(user => {
            if (!user.lastKnownLocation || (user.lastKnownLocation.lat === 0 && user.lastKnownLocation.lng === 0)) return;

            const position: [number, number] = [user.lastKnownLocation.lat, user.lastKnownLocation.lng];
            const isTenant = 'businessName' in user;
            const markerId = `${isTenant ? 'tenant' : 'staff'}-${user.id}`;
            bounds.extend(position);
            const existingMarker = currentMarkers.get(markerId);

            const iconColor = isTenant ? '#a78bfa' : '#f472b6'; // Purple for tenants, Pink for staff
            const icon = L.divIcon({
                html: userIconSvg.replace('{COLOR}', iconColor),
                className: 'user-marker',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
                popupAnchor: [0, -12]
            });
            // FIX: The 'Tenant' type does not have a 'name' property, it has 'ownerName'. Conditionally access the correct property based on the user type.
            const popupContent = `<b>${isTenant ? 'Tenant' : 'Staff'}:</b> ${isTenant ? user.ownerName : user.name}<br><b>Last Seen:</b> ${user.lastKnownLocation.timestamp.toLocaleString()}`;

            if (existingMarker) {
                existingMarker.setLatLng(position).setPopupContent(popupContent);
            } else {
                const newMarker = L.marker(position, { icon }).bindPopup(popupContent).addTo(map);
                currentMarkers.set(markerId, newMarker);
            }
        });
        
        // Editable branch marker
        if (editableBranch) {
             const position: [number, number] = [editableBranch.branch.location.lat, editableBranch.branch.location.lng];
            const markerId = `branch-${editableBranch.branch.id}`;
            bounds.extend(position);
            
            const icon = L.divIcon({
                html: branchIconSvg,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });
            
            let marker = currentMarkers.get(markerId);
            if (!marker) {
                marker = L.marker(position, { icon, draggable: true }).addTo(map);
                marker.on('dragend', (event: any) => {
                    editableBranch.onPositionChange(event.target.getLatLng());
                });
                currentMarkers.set(markerId, marker);
            }
            marker.setLatLng(position);
        }

        // Fit map to bounds if there are items to show
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [trucks, branches, users, editableBranch]);

    // FIX: A React component must return a ReactNode. This div is used by Leaflet to render the map.
    return <div ref={mapRef} className="w-full h-full" />;
};

// FIX: Add default export to be consumable by other components.
export default MapComponent;
