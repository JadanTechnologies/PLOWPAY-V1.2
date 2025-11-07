
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { SupportTicket, TicketMessage } from '../../types';
import Icon from '../icons';

const SupportManagement: React.FC = () => {
    const { supportTickets, tenants, replyToSupportTicket, updateTicketStatus } = useAppContext();
    const [activeTab, setActiveTab] = useState<SupportTicket['status'] | 'All'>('All');
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [replyMessage, setReplyMessage] = useState('');

    const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t.businessName])), [tenants]);

    const filteredTickets = useMemo(() => {
        const sorted = [...supportTickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        if (activeTab === 'All') return sorted;
        return sorted.filter(t => t.status === activeTab);
    }, [supportTickets, activeTab]);

    const handleReply = () => {
        if (selectedTicket && replyMessage.trim()) {
            replyToSupportTicket(selectedTicket.id, { sender: 'ADMIN', message: replyMessage.trim() });
            setReplyMessage('');
            // Optimistically update the selected ticket view
            setSelectedTicket(prev => prev ? {
                ...prev,
                status: 'In Progress',
                updatedAt: new Date(),
                messages: [
                    ...prev.messages,
                    { id: `msg-${Date.now()}`, sender: 'ADMIN', message: replyMessage.trim(), timestamp: new Date() }
                ]
            } : null);
        }
    };

    const handleStatusChange = (status: SupportTicket['status']) => {
        if (selectedTicket) {
            updateTicketStatus(selectedTicket.id, status);
            setSelectedTicket(prev => prev ? { ...prev, status, updatedAt: new Date() } : null);
        }
    };

    const getStatusBadge = (status: SupportTicket['status']) => {
        const styles = {
            'Open': 'bg-green-500/20 text-green-300',
            'In Progress': 'bg-yellow-500/20 text-yellow-300',
            'Closed': 'bg-slate-500/20 text-slate-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    const getPriorityBadge = (priority: SupportTicket['priority']) => {
        const styles = {
            'Low': 'bg-cyan-500/20 text-cyan-300',
            'Medium': 'bg-amber-500/20 text-amber-300',
            'High': 'bg-red-500/20 text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[priority]}`}>{priority}</span>;
    };

    const TabButton: React.FC<{ tab: SupportTicket['status'] | 'All', label: string }> = ({ tab, label }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === tab ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
            {label}
        </button>
    );

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Support Ticket Management</h2>

            <div className="flex flex-wrap gap-2 border-b border-slate-700 mb-6 pb-2">
                <TabButton tab="All" label="All Tickets" />
                <TabButton tab="Open" label="Open" />
                <TabButton tab="In Progress" label="In Progress" />
                <TabButton tab="Closed" label="Closed" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Tenant</th>
                            <th className="p-3">Subject</th>
                            <th className="p-3 text-center">Priority</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3">Last Updated</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.map(ticket => (
                            <tr key={ticket.id} className="border-b border-slate-800 hover:bg-slate-700/50 text-sm">
                                <td className="p-3 whitespace-nowrap font-medium">{tenantMap.get(ticket.tenantId) || 'Unknown Tenant'}</td>
                                <td className="p-3">{ticket.subject}</td>
                                <td className="p-3 text-center">{getPriorityBadge(ticket.priority)}</td>
                                <td className="p-3 text-center">{getStatusBadge(ticket.status)}</td>
                                <td className="p-3 whitespace-nowrap text-slate-400">{new Date(ticket.updatedAt).toLocaleString()}</td>
                                <td className="p-3 text-center">
                                    <button onClick={() => setSelectedTicket(ticket)} className="text-cyan-400 hover:text-cyan-300 font-semibold text-xs">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredTickets.length === 0 && <p className="text-center text-slate-500 py-12">No tickets in this category.</p>}
            </div>

            {selectedTicket && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-700">
                        <div className="p-4 border-b border-slate-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedTicket.subject}</h3>
                                    <p className="text-sm text-slate-400">From: {tenantMap.get(selectedTicket.tenantId)}</p>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-white"><Icon name="x-mark" className="w-6 h-6"/></button>
                            </div>
                             <div className="flex items-center gap-4 mt-2 text-sm">
                                {getPriorityBadge(selectedTicket.priority)}
                                {getStatusBadge(selectedTicket.status)}
                                <span className="text-slate-400">{selectedTicket.department}</span>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {selectedTicket.messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'ADMIN' ? 'bg-cyan-900/50' : 'bg-slate-700'}`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <p className="text-xs text-slate-500 text-right mt-1">{new Date(msg.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {selectedTicket.status !== 'Closed' && (
                            <div className="p-4 border-t border-slate-700 bg-slate-900/50">
                                <textarea
                                    value={replyMessage}
                                    onChange={e => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={3}
                                    className="w-full bg-slate-700 p-2 rounded-md border border-slate-600 focus:ring-cyan-500 focus:outline-none"
                                />
                                <div className="mt-2 flex justify-between items-center">
                                     <div className="space-x-2">
                                        <button onClick={() => handleStatusChange('Open')} className="text-xs font-semibold text-white bg-green-600/50 hover:bg-green-600/80 px-2 py-1 rounded-md">Mark as Open</button>
                                        <button onClick={() => handleStatusChange('In Progress')} className="text-xs font-semibold text-white bg-yellow-600/50 hover:bg-yellow-600/80 px-2 py-1 rounded-md">Mark In Progress</button>
                                        <button onClick={() => handleStatusChange('Closed')} className="text-xs font-semibold text-white bg-slate-600/50 hover:bg-slate-600/80 px-2 py-1 rounded-md">Close Ticket</button>
                                    </div>
                                    <button onClick={handleReply} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Send Reply</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportManagement;