
import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { Truck, Shipment, TrackerProvider, Branch, Staff, Sale, ProductVariant } from '../types';
import Icon from './icons';

type ModalState = 'NONE' | 'TRUCK' | 'SHIPMENT' | 'BRANCH' | 'STAFF' | 'SELL_SHIPMENT';

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
      trucks, shipments, trackerProviders, branches, staff, products,
      addTruck, updateTruck, addShipment, updateShipmentStatus, 
      updateTrackerProviders, addBranch, addStaff, sellShipment, receiveShipment
    } = useAppContext();
    type ActiveTab = 'dashboard' | 'trucks' | 'shipments' | 'branches' | 'settings';
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [modal, setModal] = useState<ModalState>('NONE');
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(branches[0] || null);
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

    // Form states
    const [truckForm, setTruckForm] = useState({ licensePlate: '', driverName: '', status: 'IDLE' as Truck['status'] });
    const [branchForm, setBranchForm] = useState({ name: '' });
    const [staffForm, setStaffForm] = useState({ name: '', email: '', role: 'Cashier' as Staff['role'], branchId: '' });
    const [sellShipmentForm, setSellShipmentForm] = useState<Sale['customer']>({ name: '', phone: '' });
    const [trackerSettingsForm, setTrackerSettingsForm] = useState<TrackerProvider[]>(trackerProviders);

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
        deliveredShipments: shipments.filter(s => s.status === 'DELIVERED').length,
    }), [trucks, shipments]);

    const handleOpenModal = (modalType: ModalState, data?: any) => {
        if (modalType === 'SELL_SHIPMENT' && data) {
            setSelectedShipment(data);
            setSellShipmentForm({ name: '', phone: '' });
        }
        if (modalType === 'STAFF' && selectedBranch) {
            setStaffForm({ name: '', email: '', role: 'Cashier', branchId: selectedBranch.id });
        }
        setModal(modalType);
    };

    const handleCloseModal = () => setModal('NONE');

    const handleAddTruck = () => {
        addTruck({ ...truckForm, currentLocation: { lat: 0, lng: 0, address: 'N/A' }});
        handleCloseModal();
    };

    const handleAddBranch = () => {
        if(branchForm.name.trim()){
            addBranch(branchForm.name);
            setBranchForm({name: ''});
            handleCloseModal();
        }
    };

    const handleAddStaff = () => {
        if(staffForm.name.trim() && staffForm.email.trim() && staffForm.branchId) {
            addStaff(staffForm);
            handleCloseModal();
        }
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
                           <MetricCard title="Shipments In-Transit" value={metrics.inTransitShipments} iconName="pos" iconBgColor="bg-purple-500" />
                           <MetricCard title="Shipments Delivered" value={metrics.deliveredShipments} iconName="inventory" iconBgColor="bg-green-500" />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                                <h3 className="mb-4 text-lg font-semibold text-white">Live Fleet Map</h3>
                                <div className="bg-gray-900/50 rounded-lg h-80 flex flex-col p-4 overflow-y-auto">
                                    {trucks.map(truck => (
                                        <div key={truck.id} className="flex items-center p-2 rounded-md hover:bg-gray-700/50">
                                            <Icon name="map-pin" className={`w-6 h-6 mr-3 ${truck.status === 'IN_TRANSIT' ? 'text-blue-400' : 'text-gray-500'}`} />
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
                               <thead className="border-b border-gray-700">
                                   <tr>
                                       <th className="p-3">License Plate</th><th className="p-3">Driver Name</th><th className="p-3">Current Location</th><th className="p-3">Last Update</th><th className="p-3 text-center">Status</th>
                                   </tr>
                               </thead>
                               <tbody>
                                {trucks.map(truck => (
                                    <tr key={truck.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                                        <td className="p-3 font-mono">{truck.licensePlate}</td><td className="p-3">{truck.driverName}</td><td className="p-3">{truck.currentLocation.address}</td><td className="p-3 text-sm text-gray-400">{truck.lastUpdate.toLocaleString()}</td><td className="p-3 text-center">{getStatusBadge(truck.status)}</td>
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
            case 'branches':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 p-4 bg-gray-800 rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Branches</h3>
                                <button onClick={() => handleOpenModal('BRANCH')} className="p-1 bg-indigo-600 rounded-md hover:bg-indigo-500"><Icon name="plus" className="w-4 h-4"/></button>
                            </div>
                            <ul className="space-y-2">
                                {branches.map(branch => (
                                    <li key={branch.id} onClick={() => setSelectedBranch(branch)} className={`p-2 rounded-md cursor-pointer ${selectedBranch?.id === branch.id ? 'bg-indigo-600 text-white' : 'hover:bg-gray-700'}`}>
                                        {branch.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-2 p-4 bg-gray-800 rounded-lg">
                            {selectedBranch ? (
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold">Staff at {selectedBranch.name}</h3>
                                        <button onClick={() => handleOpenModal('STAFF')} className="bg-indigo-600 text-sm flex items-center gap-1 py-1 px-2 rounded-md hover:bg-indigo-500">
                                            <Icon name="plus" className="w-4 h-4"/> Add Staff
                                        </button>
                                    </div>
                                    <table className="w-full text-left">
                                        <thead className="border-b border-gray-700 text-sm">
                                            <tr><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Role</th></tr>
                                        </thead>
                                        <tbody>
                                            {staff.filter(s => s.branchId === selectedBranch.id).map(s => (
                                                <tr key={s.id} className="border-b border-gray-700 text-sm">
                                                    <td className="p-2">{s.name}</td><td className="p-2">{s.email}</td><td className="p-2">{s.role}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <p className="text-center text-gray-500">Select a branch to view staff.</p>}
                        </div>
                    </div>
                );
             case 'settings':
                 return (
                     <div className="p-6 bg-gray-800 rounded-lg shadow-md max-w-2xl mx-auto">
                         <h2 className="text-2xl font-bold text-white mb-6">Tracker Provider Settings</h2>
                         <div className="space-y-6">
                            {trackerSettingsForm.map(provider => (
                                <div key={provider.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-xl font-semibold text-white mb-4">{provider.name}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400">API Key</label>
                                            <input 
                                                type="password" 
                                                value={provider.apiKey} 
                                                onChange={e => handleTrackerSettingsChange(provider.id, 'apiKey', e.target.value)}
                                                placeholder="Enter API Key" 
                                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-gray-400">API Endpoint URL</label>
                                            <input 
                                                type="text" 
                                                value={provider.apiEndpoint} 
                                                onChange={e => handleTrackerSettingsChange(provider.id, 'apiEndpoint', e.target.value)}
                                                placeholder="Enter API Endpoint" 
                                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                        <TabButton tab="branches" label="Branches & Staff" />
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
                            <div><label className="text-sm">Status</label><select onChange={e => setTruckForm({...truckForm, status: e.target.value as Truck['status']})} className="w-full bg-gray-700 p-2 rounded-md mt-1"><option>IDLE</option><option>IN_TRANSIT</option><option>MAINTENANCE</option></select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddTruck} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
             {modal === 'BRANCH' && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add New Branch</h3>
                        <div><label className="text-sm">Branch Name</label><input type="text" value={branchForm.name} onChange={e => setBranchForm({name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddBranch} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
             {modal === 'STAFF' && selectedBranch && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Add Staff to {selectedBranch.name}</h3>
                        <div className="space-y-4">
                            <div><label className="text-sm">Name</label><input type="text" onChange={e => setStaffForm({...staffForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Email</label><input type="email" onChange={e => setStaffForm({...staffForm, email: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Role</label><select onChange={e => setStaffForm({...staffForm, role: e.target.value as Staff['role']})} className="w-full bg-gray-700 p-2 rounded-md mt-1"><option>Cashier</option><option>Manager</option><option>Logistics</option></select></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleAddStaff} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500">Save</button></div>
                    </div>
                </div>
            )}
            {modal === 'SELL_SHIPMENT' && selectedShipment && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Sell Cargo of {selectedShipment.shipmentCode}</h3>
                         <p className="text-sm text-gray-400 mb-4">This will create a direct sale for all items in the shipment to a single customer.</p>
                        <div className="space-y-4">
                            <div><label className="text-sm">Customer Name</label><input type="text" onChange={e => setSellShipmentForm({...sellShipmentForm, name: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                            <div><label className="text-sm">Customer Phone (Optional)</label><input type="tel" onChange={e => setSellShipmentForm({...sellShipmentForm, phone: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1"/></div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6"><button onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button><button onClick={handleSellShipment} className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500">Confirm Sale</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LogisticsManagement;