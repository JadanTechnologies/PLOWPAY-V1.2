import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Truck, Shipment, TrackerProvider, Customer } from '../../types';
import Icon from './icons/index.tsx';
import GoogleMap from './GoogleMap.tsx';

type ModalState = 'NONE' | 'TRUCK' | 'SHIPMENT' | 'SELL_SHIPMENT';

const MetricCard: React.FC<{ title: string; value: string | number; iconName: string; iconBgColor: string }> = ({ title, value, iconName, iconBgColor }) => (
  <div className="p-4 bg-gray-800 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full ${iconBgColor} mr-4`}>
      <Icon name={iconName} className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const getStatusBadge = (status: Truck['status'] | Shipment['status']) => {
    const truckStyles: { [key in Truck['status']]: string } = {
        IDLE: 'bg-gray-500/20 text-gray-300',
        IN_TRANSIT: 'bg-blue-500/20 text-blue-300',
        MAINTENANCE: 'bg-yellow-500/20 text-yellow-300',
    };
    const shipmentStyles: { [key in Shipment['status']]: string } = {
        PENDING: 'bg-yellow-500/20 text-yellow-300',
        IN_TRANSIT: 'bg-blue-500/20 text-blue-300',
        DELIVERED: 'bg-green-500/20 text-green-300',
        DELAYED: 'bg-red-500/20 text-red-300',
        SOLD_IN_TRANSIT: 'bg-purple-500/20 text-purple-300'
    };
    const styles = { ...truckStyles, ...shipmentStyles };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status.replace(/_/g, ' ')}</span>;
};


const LogisticsManagement: React.FC = () => {
    const { 
      trucks, shipments, trackerProviders, branches, currentTenant,
      addTruck, 
      updateTrackerProviders, sellShipment, receiveShipment,
      updateTruckVitals, updateTenantLogisticsConfig
    } = useAppContext();
    type ActiveTab = 'dashboard' | 'trucks' | 'shipments' | 'settings';
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [modal, setModal] = useState<ModalState>('NONE');
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [isMapModalOpen, setMapModalOpen] = useState(false);

    // Form states
    const [truckForm, setTruckForm] = useState({ licensePlate: '', driverName: '', status: 'IDLE' as Truck['status'], maxLoad: 20000 });
    const [sellShipmentForm, setSellShipmentForm] = useState<Pick<Customer, 'name' | 'phone'>>({ name: '', phone: '' });
    const [trackerSettingsForm, setTrackerSettingsForm] = useState<TrackerProvider[]>(trackerProviders);
    
    const activeTrackerProviderId = currentTenant?.logisticsConfig?.activeTrackerProviderId || trackerProviders[0]?.id || '';

    useEffect(() => {
        setTrackerSettingsForm(trackerProviders);
    }, [trackerProviders]);
    
    const handleTrackerSettingsChange = (id: string, field: 'apiKey' | 'apiEndpoint', value: string) => {
        setTrackerSettingsForm(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
    };

    const handleSaveTrackerSettings = () => {
        updateTrackerProviders(trackerSettingsForm);
        alert('Tracker provider settings saved successfully!');
    };


    const TabButton: React.FC<{tab: ActiveTab, label: string}> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
        </button>
    );

    const metrics = useMemo(() => ({
        totalTrucks: trucks.length,
        inTransitTrucks: trucks.filter(t => t.status === 'IN_TRANSIT').length,
        inTransitShipments: shipments.filter(s => s.status === 'IN_TRANSIT').length,
        totalLoadInTransit: trucks.filter(t => t.status === 'IN_TRANSIT').reduce((sum, t) => sum + t.currentLoad, 0),
    }), [trucks, shipments]);

    const handleOpenModal = (modalType: ModalState, data?: any) => {
        if (modalType === 'TRUCK') {
            setTruckForm({ licensePlate: '', driverName: '', status: 'IDLE', maxLoad: 20000 });
        }
        if (modalType === 'SELL_SHIPMENT' && data) {
            setSelectedShipment(data);
            setSellShipmentForm({ name: '', phone: '' });
        }
        setModal(modalType);
    };

    const handleCloseModal = () => setModal('NONE');

    const handleAddTruck = () => {
        if (!currentTenant) return;
        addTruck({ ...truckForm, tenantId: currentTenant.id, currentLoad: 0, currentLocation: { lat: 0, lng: 0, address: 'N/A' }});
        handleCloseModal();
    };

    const handleSellShipment = async () => {
        if (selectedShipment && sellShipmentForm.name.trim()) {
            await sellShipment(selectedShipment.id, sellShipmentForm);
            handleCloseModal();
        }
    }
    
    const branchMap = useMemo(() => new Map(branches.map(b => [b.id, b.name])), [branches]);
    const truckMap = useMemo(() => new Map(trucks.map(t => [t.id, t.licensePlate])), [trucks]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                 return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                           <MetricCard title="Total Trucks" value={metrics.totalTrucks} iconName="truck" iconBgColor="bg-blue-500" />
                           <MetricCard title="Trucks In-Transit" value={metrics.inTransitTrucks} iconName="truck" iconBgColor="bg-cyan-500" />
                           <MetricCard title="Total Load In-Transit" value={`${(metrics.totalLoadInTransit / 1000).toFixed(1)} t`} iconName="inventory" iconBgColor="bg-purple-500" />
                           <MetricCard title="Shipments In-Transit" value={metrics.inTransitShipments} iconName="pos" iconBgColor="bg-orange-500" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold text-white">Live Fleet Status</h3>
                                <button onClick={() => setMapModalOpen(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center mb-4 transition-transform hover:scale-105">
                                    <Icon name="map-pin" className="w-6 h-6 mr-3"/>View Live Fleet Map
                                </button>
                                <div className="bg-gray-900/50 rounded-lg h-64 flex flex-col p-2 overflow-y-auto">
                                    {trucks.map(truck => (
                                        <div key={truck.id} className="flex items-center p-2 rounded-md hover:bg-gray-700/50">
                                            <Icon name="truck" className={`w-6 h-6 mr-3 ${truck.status === 'IN_TRANSIT' ? 'text-blue-400' : 'text-gray-500'}`} />
                                            <div>
                                                <p className="font-semibold">{truck.licensePlate} - {truck.driverName}</p>
                                                <p className="text-sm text-gray-400">{truck.currentLocation.address}</p>
                                            </div>
                                            <div className="ml-auto">{getStatusBadge(truck.status)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold text-white">Ongoing Shipments</h3>
                                 <div className="overflow-y-auto h-80">
                                  <table className="w-full text-left">
                                      <tbody>
                                        {shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING').map(shipment => (
                                            <tr key={shipment.id} className="border-b border-gray-700">
                                                <td className="p-2">
                                                    <p className="font-semibold">{shipment.shipmentCode}</p>
                                                    <p className="text-sm text-gray-400">{shipment.origin} to {branchMap.get(shipment.destination)}</p>
                                                </td>
                                                <td className="p-2 text-right">{getStatusBadge(shipment.status)}</td>
                                            </tr>
                                        ))}
                                      </tbody>
                                  </table>
                                 </div>
                            </div>
                        </div>
                    </div>
                );
            case 'trucks':
                 return (
                     <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Manage Trucks</h2>
                            <button onClick={() => handleOpenModal('TRUCK')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                                <Icon name="plus" className="w-5 h-5 mr-2" /> Add Truck
                            </button>
                         </div>
                         <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="border-b border-gray-700 text-xs uppercase">
                                   <tr>
                                       <th className="p-3">License Plate</th><th className="p-3">Driver Name</th><th className="p-3">Load</th><th className="p-3">Location</th><th className="p-3">Last Update</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Actions</th>
                                   </tr>
                               </thead>
                               <tbody>
                                {trucks.map(truck => (
                                    <tr key={truck.id} className="border-b border-gray-700 hover:bg-gray-700/50 text-sm">
                                        <td className="p-3 font-mono">{truck.licensePlate}</td><td className="p-3">{truck.driverName}</td>
                                        <td className="p-3">
                                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(truck.currentLoad / truck.maxLoad) * 100}%` }}></div>
                                            </div>
                                            <div className="text-xs text-center mt-1 text-gray-400">
                                                {(truck.currentLoad / 1000).toFixed(1)}t / {(truck.maxLoad / 1000).toFixed(1)}t
                                            </div>
                                        </td>
                                        <td className="p-3">{truck.currentLocation.address}</td><td className="p-3 text-gray-400">{truck.lastUpdate.toLocaleString()}</td><td className="p-3 text-center">{getStatusBadge(truck.status)}</td>
                                        <td className="p-3 text-center">
                                            <button onClick={() => updateTruckVitals(truck.id)} className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs">Simulate Update</button>
                                        </td>
                                    </tr>
                                ))}
                               </tbody>
                           </table>
                         </div>
                     </div>
                );
            case 'shipments':
                 return (
                     <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                         <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Manage Shipments</h2>
                         </div>
                         <div className="overflow-x-auto">
                           <table className="w-full text-left">
                               <thead className="border-b border-gray-700">
                                   <tr>
                                       <th className="p-3">Code</th><th className="p-3">Route</th><th className="p-3">Truck</th><th className="p-3">ETA</th><th className="p-3 text-center">Status</th><th className="p-3 text-center">Actions</th>
                                   </tr>
                               </thead>
                               <tbody>
                                {shipments.map(shipment => (
                                    <tr key={shipment.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3 font-mono">{shipment.shipmentCode}</td>
                                        <td className="p-3">{shipment.origin} <Icon name="chevronRight" className="w-4 h-4 inline-block"/> {branchMap.get(shipment.destination) || 'N/A'}</td>
                                        <td className="p-3">{truckMap.get(shipment.truckId) || 'N/A'}</td>
                                        <td className="p-3 text-sm text-gray-400">{shipment.estimatedDelivery.toLocaleDateString()}</td>
                                        <td className="p-3 text-center">{getStatusBadge(shipment.status)}</td>
                                        <td className="p-3 text-center space-x-2">
                                            {shipment.status === 'IN_TRANSIT' && <button onClick={() => receiveShipment(shipment.id)} className="text-green-400 hover:text-green-300 font-semibold text-xs">Receive</button>}
                                            {(shipment.status === 'PENDING' || shipment.status === 'IN_TRANSIT') && <button onClick={() => handleOpenModal('SELL_SHIPMENT', shipment)} className="text-purple-400 hover:text-purple-300 font-semibold text-xs">Sell Cargo</button>}
                                        </td>
                                    </tr>
                                ))}
                               </tbody>
                           </table>
                         </div>
                     </div>
                );
            case 'settings':
                 const selectedProvider = trackerSettingsForm.find(p => p.id === activeTrackerProviderId);
                 return (
                     <div className="p-6 bg-gray-800 rounded-lg shadow-md max-w-2xl mx-auto">
                         <h2 className="text-2xl font-bold text-white mb-6">Tracker Provider Settings</h2>
                         <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Active Tracker Provider</label>
                                <select
                                    value={activeTrackerProviderId}
                                    onChange={e => updateTenantLogisticsConfig({ activeTrackerProviderId: e.target.value })}
                                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {trackerProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            {selectedProvider && (
                                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-semibold text-white mb-4">Configure {selectedProvider.name}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">API Key</label>
                                            <input 
                                                type="password" 
                                                value={selectedProvider.apiKey} 
                                                onChange={e => handleTrackerSettingsChange(selectedProvider.id, 'apiKey', e.target.value)}
                                                placeholder="Enter API Key" 
                                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-gray-400">API Endpoint URL</label>
                                            <input 
                                                type="text" 
                                                value={selectedProvider.apiEndpoint} 
                                                onChange={e => handleTrackerSettingsChange(selectedProvider.id, 'apiEndpoint', e.target.value)}
                                                placeholder="Enter API Endpoint" 
                                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                         </div>
                         <div className="text-right mt-6">
                            <button onClick={handleSaveTrackerSettings} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md">Save Settings</button>
                         </div>
                     </div>
                );
        }
    }

    return (
        <div className="space-y-6">
             <div className="bg-gray-800/50 rounded-lg p-1">
                 <div className="border-b border-gray-700">
                    <nav className="flex space-x-2">
                        <TabButton tab="dashboard" label="Dashboard" />
                        <TabButton tab="trucks" label="Trucks" />
                        <TabButton tab="shipments" label="Shipments" />
                        <TabButton tab="settings" label="Settings" />
                    </nav>
                </div>
            </div>
            {renderContent()}

            {/* Modals */}
            {modal === 'TRUCK' && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Truck</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm">License Plate</label><input type="text" onChange={e => setTruckForm({...truckForm, licensePlate: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Driver Name</label><input type="text" onChange={e => setTruckForm({...truckForm, driverName: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Max Load (kg)</label><input type="number" value={truckForm.maxLoad} onChange={e => setTruckForm({...truckForm, maxLoad: parseInt(e.target.value, 10) || 0})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Status</label><select onChange={e => setTruckForm({...truckForm, status: e.target.value as Truck['status']})} className="w-full bg-gray-700 p-2 rounded-md mt-1"><option>IDLE</option><option>IN_TRANSIT</option><option>MAINTENANCE</option></select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddTruck} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
            {modal === 'SELL_SHIPMENT' && selectedShipment && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Sell Cargo of {selectedShipment.shipmentCode}</h3>
                         <p className="text-sm text-gray-400 mb-4">This will create a direct sale for all items in the shipment to a single customer.</p>
                        <div className="space-y-4">
                            <div><label className="text-sm">Customer Name</label><input type="text" value={sellShipmentForm.name} onChange={e => setSellShipmentForm({...sellShipmentForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Customer Phone (Optional)</label><input type="tel" value={sellShipmentForm.phone} onChange={e => setSellShipmentForm({...sellShipmentForm, phone: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleSellShipment} className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500">Confirm Sale</button></div>
                    </div>
                </div>
            )}
            {isMapModalOpen && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col p-4">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-white">Live Fleet Map</h2>
                        <button onClick={() => setMapModalOpen(false)} className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2">
                            <Icon name="x-mark" className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="relative flex-grow bg-gray-800 rounded-lg overflow-hidden">
                        {typeof window.L === 'undefined' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <Icon name="x-mark" className="w-16 h-16 text-red-500 mb-4" />
                                <h3 className="text-2xl font-bold text-white">Map Library Failed to Load</h3>
                                <p className="text-slate-400 mt-2 max-w-md">
                                    Please check your internet connection and ensure LeafletJS is correctly loaded. The map cannot be displayed without it.
                                </p>
                            </div>
                        ) : (
                            <GoogleMap trucks={trucks} shipments={shipments} branches={branches} />
                        )}
                    </div>
                </div>
             )}
        </div>
    );
};

export default LogisticsManagement;