import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { EmailTemplate, SmsTemplate } from '../../types';
import Icon from '../icons';
import ConfirmationModal from '../ConfirmationModal';

const TemplateManagement: React.FC = () => {
    const { 
        emailTemplates, smsTemplates, currentTenant, 
        addTenantEmailTemplate, updateTenantEmailTemplate, deleteTenantEmailTemplate,
        addTenantSmsTemplate, updateTenantSmsTemplate, deleteTenantSmsTemplate,
        setNotification
    } = useAppContext();
    
    const [activeTab, setActiveTab] = useState<'email' | 'sms'>('email');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | SmsTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<{ id: string, type: 'email' | 'sms' } | null>(null);

    const initialFormState = { name: '', subject: '', body: '' };
    const [formData, setFormData] = useState(initialFormState);

    const tenantEmailTemplates = useMemo(() => emailTemplates.filter(t => t.tenantId === currentTenant?.id), [emailTemplates, currentTenant]);
    const tenantSmsTemplates = useMemo(() => smsTemplates.filter(t => t.tenantId === currentTenant?.id), [smsTemplates, currentTenant]);
    
    const openModal = (template: EmailTemplate | SmsTemplate | null = null, type: 'email' | 'sms' = 'email') => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name,
                subject: 'subject' in template ? template.subject : '',
                body: template.body
            });
        } else {
            setEditingTemplate(null);
            setFormData(initialFormState);
        }
        setActiveTab(type); // Ensure the modal matches the current view if adding new
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const existingTemplates = activeTab === 'email' ? tenantEmailTemplates : tenantSmsTemplates;
        if (!editingTemplate && existingTemplates.some(t => t.name.toLowerCase() === formData.name.toLowerCase())) {
            setNotification({ type: 'error', message: 'A template with this name already exists.' });
            return;
        }

        if (editingTemplate) { // Update
            if (activeTab === 'email') {
                updateTenantEmailTemplate(editingTemplate.id, { name: formData.name, subject: formData.subject, body: formData.body });
            } else {
                updateTenantSmsTemplate(editingTemplate.id, { name: formData.name, body: formData.body });
            }
        } else { // Create
            if (activeTab === 'email') {
                addTenantEmailTemplate({ name: formData.name, subject: formData.subject, body: formData.body });
            } else {
                addTenantSmsTemplate({ name: formData.name, body: formData.body });
            }
        }
        closeModal();
    };

    const handleDelete = () => {
        if (deletingTemplate) {
            if (deletingTemplate.type === 'email') {
                deleteTenantEmailTemplate(deletingTemplate.id);
            } else {
                deleteTenantSmsTemplate(deletingTemplate.id);
            }
        }
    };

    const TemplateList: React.FC<{ templates: (EmailTemplate | SmsTemplate)[], type: 'email' | 'sms' }> = ({ templates, type }) => (
        <div className="space-y-3">
            {templates.map(template => (
                <div key={template.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-white">{template.name}</h4>
                        {type === 'email' && 'subject' in template && <p className="text-sm text-slate-400 mt-1">Subject: {template.subject}</p>}
                        <p className="text-sm text-slate-500 mt-2 font-mono bg-slate-800/50 p-2 rounded-md whitespace-pre-wrap truncate">{template.body}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4 space-x-2">
                        <button onClick={() => openModal(template, type)} className="text-yellow-400 font-semibold text-sm">Edit</button>
                        <button onClick={() => setDeletingTemplate({ id: template.id, type })} className="text-rose-400 font-semibold text-sm">Delete</button>
                    </div>
                </div>
            ))}
            {templates.length === 0 && (
                 <div className="text-center py-12 text-slate-500">
                    <Icon name="clipboard-document-list" className="w-12 h-12 mx-auto mb-2"/>
                    <p>No {type} templates created yet.</p>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">My Templates</h2>
                        <p className="text-slate-400 mt-1">Create and manage templates for customer communications.</p>
                    </div>
                    <button onClick={() => openModal(null, activeTab)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        New Template
                    </button>
                </div>
            </div>

            <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
                 <div className="flex flex-wrap gap-2 border-b border-slate-700 mb-6 pb-2">
                    <button onClick={() => setActiveTab('email')} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'email' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        <Icon name="at-symbol" className="w-5 h-5 inline-block mr-2" />Email Templates
                    </button>
                    <button onClick={() => setActiveTab('sms')} className={`px-4 py-2 font-medium text-sm rounded-md ${activeTab === 'sms' ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        <Icon name="chat-bubble-left-right" className="w-5 h-5 inline-block mr-2" />SMS Templates
                    </button>
                </div>
                {activeTab === 'email' ? <TemplateList templates={tenantEmailTemplates} type="email" /> : <TemplateList templates={tenantSmsTemplates} type="sms" />}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingTemplate ? 'Edit' : 'Create'} {activeTab === 'email' ? 'Email' : 'SMS'} Template</h3>
                        <div className="space-y-4">
                            <input name="name" placeholder="Template Name" value={formData.name} onChange={handleFormChange} required className="w-full bg-slate-700 p-2 rounded-md" />
                            {activeTab === 'email' && (
                                <input name="subject" placeholder="Email Subject" value={formData.subject} onChange={handleFormChange} required className="w-full bg-slate-700 p-2 rounded-md" />
                            )}
                            <textarea name="body" placeholder="Template Body" value={formData.body} onChange={handleFormChange} rows={8} required className="w-full bg-slate-700 p-2 rounded-md font-mono text-sm" />
                             <p className="text-xs text-slate-500">You can use placeholders like {'{{customerName}}'} and {'{{businessName}}'}.</p>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 font-semibold">{editingTemplate ? 'Save Changes' : 'Create Template'}</button>
                        </div>
                    </form>
                </div>
            )}
            <ConfirmationModal
                isOpen={!!deletingTemplate}
                onClose={() => setDeletingTemplate(null)}
                onConfirm={handleDelete}
                title="Delete Template"
                confirmText="Delete"
            >
                Are you sure you want to delete this template? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default TemplateManagement;
