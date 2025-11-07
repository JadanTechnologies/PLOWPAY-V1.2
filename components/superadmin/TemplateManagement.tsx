import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { EmailTemplate, SmsTemplate } from '../../types';
import Icon from '../icons';

const TemplateManagement: React.FC = () => {
    const { emailTemplates, smsTemplates, updateEmailTemplate, updateSmsTemplate } = useAppContext();
    const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
    
    const [emailForm, setEmailForm] = useState<EmailTemplate[]>(emailTemplates);
    const [smsForm, setSmsForm] = useState<SmsTemplate[]>(smsTemplates);

    useEffect(() => setEmailForm(emailTemplates), [emailTemplates]);
    useEffect(() => setSmsForm(smsTemplates), [smsTemplates]);

    const handleEmailChange = (id: string, field: 'subject' | 'body', value: string) => {
        setEmailForm(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleSmsChange = (id: string, value: string) => {
        setSmsForm(prev => prev.map(t => t.id === id ? { ...t, body: value } : t));
    };
    
    const handleSave = () => {
        emailForm.forEach(template => {
            const original = emailTemplates.find(t => t.id === template.id);
            if (original && (original.subject !== template.subject || original.body !== template.body)) {
                updateEmailTemplate(template.id, template.subject, template.body);
            }
        });
        smsForm.forEach(template => {
            const original = smsTemplates.find(t => t.id === template.id);
            if (original && original.body !== template.body) {
                updateSmsTemplate(template.id, template.body);
            }
        });
        alert('Templates saved successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Template Management</h2>
                        <p className="text-gray-400 mt-1">Customize automated email and SMS notifications.</p>
                    </div>
                    <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">Save All Templates</button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-md p-6">
                <div className="border-b border-gray-700 mb-4">
                    <nav className="flex space-x-2">
                        <button onClick={() => setActiveTab('email')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'email' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>Email Templates</button>
                        <button onClick={() => setActiveTab('sms')} className={`px-3 py-2 font-medium text-sm rounded-t-md ${activeTab === 'sms' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white'}`}>SMS Templates</button>
                    </nav>
                </div>
                
                {/* FIX: Corrected invalid JSX for placeholders. They are now string literals. */}
                <p className="text-sm text-gray-400 mb-4">You can use placeholders like {`{{tenantName}}`}, {`{{planName}}`}, {`{{amount}}`} in your templates.</p>
                
                <div className="space-y-6">
                    {activeTab === 'email' && emailForm.map(template => (
                        <div key={template.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-3">{template.name}</h3>
                            <div className="space-y-3">
                                <input type="text" value={template.subject} onChange={e => handleEmailChange(template.id, 'subject', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white border border-gray-600 focus:ring-cyan-500" placeholder="Email Subject"/>
                                <textarea rows={6} value={template.body} onChange={e => handleEmailChange(template.id, 'body', e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white border border-gray-600 focus:ring-cyan-500 font-mono text-sm" placeholder="Email Body"/>
                            </div>
                        </div>
                    ))}

                    {activeTab === 'sms' && smsForm.map(template => (
                         <div key={template.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold text-white mb-3">{template.name}</h3>
                            <div className="space-y-3">
                                <textarea rows={3} value={template.body} onChange={e => handleSmsChange(template.id, e.target.value)} className="w-full bg-gray-700 p-2 rounded-md text-white border border-gray-600 focus:ring-cyan-500 font-mono text-sm" placeholder="SMS Body"/>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TemplateManagement;