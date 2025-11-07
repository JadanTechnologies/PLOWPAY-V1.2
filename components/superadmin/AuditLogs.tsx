
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { AuditLog } from '../../types';
import Icon from '../icons';

const SuperAdminAuditLogs: React.FC = () => {
    const { auditLogs } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | AuditLog['userType']>('ALL');
    const [dateRange, setDateRange] = useState<{ start: string, end: string }>({ start: '', end: '' });

    const sortedLogs = useMemo(() => {
        return [...auditLogs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }, [auditLogs]);

    const filteredLogs = useMemo(() => {
        return sortedLogs.filter(log => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = lowerSearch === '' ||
                log.userName.toLowerCase().includes(lowerSearch) ||
                log.action.toLowerCase().replace(/_/g, ' ').includes(lowerSearch) ||
                log.details.toLowerCase().includes(lowerSearch);

            const matchesUserType = userTypeFilter === 'ALL' || log.userType === userTypeFilter;

            const logDate = log.timestamp;
            const matchesStartDate = !dateRange.start || logDate >= new Date(dateRange.start);
            const matchesEndDate = !dateRange.end || logDate <= new Date(new Date(dateRange.end).setHours(23, 59, 59, 999));
            
            return matchesSearch && matchesUserType && matchesStartDate && matchesEndDate;
        });
    }, [sortedLogs, searchTerm, userTypeFilter, dateRange]);

    const getUserTypeBadge = (userType: AuditLog['userType']) => {
        const styles = {
            SUPER_ADMIN: 'bg-cyan-500/20 text-cyan-300',
            TENANT: 'bg-indigo-500/20 text-indigo-300',
            STAFF: 'bg-slate-500/20 text-slate-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[userType]}`}>{userType.replace('_', ' ')}</span>;
    };
    
    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Platform Audit Logs</h2>
                    <p className="text-slate-400 mt-1">Track all significant activities across the platform.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="relative">
                    <Icon name="search" className="w-5 h-5 text-slate-500 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                 <div>
                    <select
                        value={userTypeFilter}
                        onChange={e => setUserTypeFilter(e.target.value as any)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="ALL">All User Types</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                        <option value="TENANT">Tenant</option>
                        <option value="STAFF">Staff</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm"
                    />
                     <span className="text-slate-400">to</span>
                     <input
                        type="date"
                        value={dateRange.end}
                        onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Timestamp</th>
                            <th className="p-3">User</th>
                            <th className="p-3 text-center">User Type</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-700/50 text-sm">
                                <td className="p-3 whitespace-nowrap text-slate-400">{log.timestamp.toLocaleString()}</td>
                                <td className="p-3 whitespace-nowrap font-medium">{log.userName}</td>
                                <td className="p-3 whitespace-nowrap text-center">{getUserTypeBadge(log.userType)}</td>
                                <td className="p-3 whitespace-nowrap">
                                    <span className="font-mono text-xs bg-slate-700 px-2 py-1 rounded">{log.action}</span>
                                </td>
                                <td className="p-3">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <Icon name="clipboard-document-list" className="w-12 h-12 mx-auto mb-2"/>
                        <p>No audit logs found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminAuditLogs;
