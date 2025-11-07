import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import GoogleMap from '../GoogleMap';
import Icon from '../icons';

const FleetOverview: React.FC = () => {
    const { trucks, shipments, branches, tenants } = useAppContext();

    return (
        <div className="h-full w-full -m-4 sm:-m-6 lg:-m-8 flex flex-col">
             {typeof window.google === 'undefined' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-800 rounded-lg">
                    <Icon name="x-mark" className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white">Google Maps API Failed to Load</h3>
                    <p className="text-slate-400 mt-2 max-w-md">
                        Please ensure you have a valid Google Maps API key in your <code>index.html</code> file and that your internet connection is working. The map cannot be displayed without it.
                    </p>
                </div>
            ) : (
                <GoogleMap
                    trucks={trucks}
                    shipments={shipments}
                    branches={branches}
                    tenants={tenants}
                />
            )}
        </div>
    );
};

export default FleetOverview;
