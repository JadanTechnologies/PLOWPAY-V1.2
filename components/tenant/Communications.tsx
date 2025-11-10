import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Icon from '../icons';
import { Customer } from '../../types';

const Communications: React.FC = () => {
    const { customers, emailTemplates, smsTemplates, currentTenant, sendBulkMessage, setNotification } = useAppContext();
    const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
    const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const tenantEmailTemplates = useMemo(() => emailTemplates.filter(t => t.tenantId === currentTenant?.id), [emailTemplates, currentTenant]);
    const tenantSmsTemplates = useMemo(() => smsTemplates.filter(t => t.tenantId === currentTenant?.id), [smsTemplates, currentTenant]);
    const availableCustomers = useMemo(() => customers.filter(c => c.id !== 'cust-walkin'), [customers]);

    const handleSelectAllCustomers = () => {
        if (selectedCustomers.size === availableCustomers.length) {
            setSelectedCustomers(new Set());
        } else {
            setSelectedCustomers(new Set(availableCustomers.map(c => c.id)));
        }
    };

    const handleCustomerToggle = (customerId: string) => {
        const newSelection = new Set(selectedCustomers);
        if (newSelection.has(customerId)) {
            newSelection.delete(customerId);
        } else {
            newSelection.add(customerId);
        }
        setSelectedCustomers(newSelection);
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        if (!templateId) {
            setSubject('');
            setMessage('');
            return;
        }

        if (activeTab === 'email') {
            const template = tenantEmailTemplates.find(t => t.id === templateId);
            if (template) {
                setSubject(template.subject);
                setMessage(template.body);
            }
        } else {
            const template = tenantSmsTemplates.find(t => t.id === templateId);
            if (template) {
                setMessage(template.body);
            }
        }
    };

    const handleSend = async () => {
        if (selectedCustomers.size === 0) {
            setNotification({ type: 'error', message: 'Please select at least one customer.' });
            return;
        }
        if (activeTab === 'email' && !subject.trim()) {
            setNotification({ type: 'error', message: 'Email subject cannot be empty.' });
            return;
        }
        if (!message.trim()) {
            setNotification({ type: 'error', message: 'Message body cannot be empty.' });
            return;
        }

        setIsLoading(true);
        const { success, message: resultMessage } = await sendBulkMessage(
            activeTab,
            Array.from(selectedCustomers),
            message,
            activeTab === 'email' ? subject : undefined
        );
        setNotification({ type: success ? 'success' : 'error', message: resultMessage });
        
        if (success) {
            setSelectedCustomers(new Set());
            setSelectedTemplateId('');
            setSubject('');
            setMessage('');
        }
        setIsLoading(false);
    };
    
    // Replace placeholders for preview
    const previewMessage = useMemo(() => {
        let preview = message;
        if (currentTenant) {
            preview = preview.replace(/{{businessName}}/g, currentTenant.businessName);
        }
        preview = preview.replace(/{{customerName}}/g, 'John Doe');
        return preview;
    }, [message, currentTenant]);

    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <h2 className="text-2xl font-bold text-white">Communications Center</h2>
                <p className="text-slate-400 mt-1">Send bulk emails or SMS messages to your customers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex gap-2 border-b border-slate-700 mb-4 pb-2">
                            <button onClick={() => setActiveTab('email')} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'email' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                <Icon name="at-symbol" className="w-5 h-5 inline-block mr-2" />Email
                            </button>
                            <button onClick={() => setActiveTab('sms')} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'sms' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                <Icon name="chat-bubble-left-right" className="w-5 h-5 inline-block mr-2" />SMS
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400">Load from Template</label>
                                <select value={selectedTemplateId} onChange={handleTemplateChange} className="w-full bg-slate-700 p-2 rounded-md mt-1">
                                    <option value="">-- Start from scratch --</option>
                                    {(activeTab === 'email' ? tenantEmailTemplates : tenantSmsTemplates).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            {activeTab === 'email' && (
                                <div>
                                    <label className="text-sm font-medium text-slate-400">Subject</label>
                                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-700 p-2 rounded-md mt-1" />
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-slate-400">Message</label>
                                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={12} className="w-full bg-slate-700 p-2 rounded-md mt-1 font-mono text-sm" />
                                <p className="text-xs text-slate-500 mt-1">Use placeholders like {'{{customerName}}'} and {'{{businessName}}'}.</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-semibold text-white mb-2">Message Preview</h3>
                        <div className="bg-slate-900/50 p-4 rounded-md border border-slate-700 min-h-[150px]">
                             {activeTab === 'email' && <p className="text-sm text-slate-400 mb-2"><strong>Subject:</strong> {subject}</p>}
                            <div className="text-sm whitespace-pre-wrap">{previewMessage}</div>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 flex flex-col">
                    <h3 className="text-lg font-semibold text-white mb-2">Select Recipients</h3>
                    <div className="flex justify-between items-center mb-2">
                        <label className="flex items-center text-sm cursor-pointer">
                            <input type="checkbox"
                                checked={selectedCustomers.size === availableCustomers.length && availableCustomers.length > 0}
                                onChange={handleSelectAllCustomers}
                                className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-cyan-500 mr-2" />
                            Select All
                        </label>
                        <span className="text-sm text-slate-400">{selectedCustomers.size} selected</span>
                    </div>
                    <div className="flex-grow overflow-y-auto bg-slate-900/50 p-2 rounded-md border border-slate-700 space-y-1">
                        {availableCustomers.map(customer => (
                             <label key={customer.id} className="flex items-center p-2 rounded-md hover:bg-slate-700/50 cursor-pointer">
                                <input type="checkbox"
                                    checked={selectedCustomers.has(customer.id)}
                                    onChange={() => handleCustomerToggle(customer.id)}
                                    className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-cyan-500 mr-3" />
                                <div>
                                    <p className="font-medium text-sm">{customer.name}</p>
                                    <p className="text-xs text-slate-500">{activeTab === 'email' ? customer.email : customer.phone}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <button onClick={handleSend} disabled={isLoading} className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center disabled:opacity-50">
                        {isLoading ? (
                             <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                        ) : (
                            <Icon name="play" className="w-5 h-5 mr-2" />
                        )}
                        Send to {selectedCustomers.size} Customer(s)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Communications;
