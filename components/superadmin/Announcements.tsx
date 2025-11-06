
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Announcement } from '../../types';
import Icon from '../icons';

const Announcements: React.FC = () => {
    const { announcements, addAnnouncement } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [formState, setFormState] = useState({
        title: '',
        content: '',
        targetAudience: 'ALL' as Announcement['targetAudience']
    });

    const handleOpenModal = () => setModalOpen(true);
    const handleCloseModal = () => {
        setModalOpen(false);
        setFormState({ title: '', content: '', targetAudience: 'ALL' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.title && formState.content) {
            addAnnouncement(formState);
            handleCloseModal();
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-gray-800 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Global Announcements</h2>
                        <p className="text-gray-400 mt-1">Communicate important updates to tenants and platform staff.</p>
                    </div>
                    <button onClick={handleOpenModal} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                        <Icon name="plus" className="w-5 h-5 mr-2" />
                        New Announcement
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {announcements.map(anno => (
                    <div key={anno.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-white">{anno.title}</h3>
                                <p className="text-sm text-gray-400">
                                    {anno.createdAt.toLocaleString()} &bull; Target: <span className="font-semibold">{anno.targetAudience}</span>
                                </p>
                            </div>
                            <span className="text-xs font-semibold bg-gray-700 px-2 py-1 rounded-full">
                                Read by {anno.readBy.length} users
                            </span>
                        </div>
                        <p className="mt-2 text-gray-300 whitespace-pre-wrap">{anno.content}</p>
                    </div>
                ))}
                 {announcements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Icon name="chat-bubble-left-right" className="w-12 h-12 mx-auto mb-2"/>
                        <p>No announcements have been sent yet.</p>
                    </div>
                )}
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4 text-white">Create Announcement</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-400">Title</label>
                                <input type="text" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-cyan-500" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400">Content</label>
                                <textarea rows={5} value={formState.content} onChange={e => setFormState({...formState, content: e.target.value})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-cyan-500" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-400">Target Audience</label>
                                <select value={formState.targetAudience} onChange={e => setFormState({...formState, targetAudience: e.target.value as Announcement['targetAudience']})} className="w-full bg-gray-700 p-2 rounded-md mt-1 text-white border border-gray-600 focus:ring-cyan-500">
                                    <option value="ALL">All Users</option>
                                    <option value="TENANTS">Tenants Only</option>
                                    <option value="STAFF">Platform Staff Only</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 font-semibold">Publish</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Announcements;
