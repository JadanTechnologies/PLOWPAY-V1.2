import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { BlogPost } from '../../types';
import Icon from '../icons';

const BlogManagement: React.FC = () => {
    const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost, currentAdminUser } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const initialFormState = {
        title: '',
        content: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
        featuredImage: ''
    };
    const [formData, setFormData] = useState(initialFormState);

    const openModal = (post: BlogPost | null = null) => {
        if (post) {
            setEditingPost(post);
            setFormData({
                title: post.title,
                content: post.content,
                status: post.status,
                featuredImage: post.featuredImage || ''
            });
        } else {
            setEditingPost(null);
            setFormData(initialFormState);
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentAdminUser) {
            alert("Could not identify admin user.");
            return;
        }

        if (editingPost) {
            updateBlogPost(editingPost.id, formData);
        } else {
            addBlogPost({ ...formData, authorId: currentAdminUser.id });
        }
        closeModal();
    };

    const handleDelete = (postId: string) => {
        if (window.confirm("Are you sure you want to delete this blog post?")) {
            deleteBlogPost(postId);
        }
    };

    const getStatusBadge = (status: 'DRAFT' | 'PUBLISHED') => {
        const styles = {
            'DRAFT': 'bg-yellow-500/20 text-yellow-300',
            'PUBLISHED': 'bg-green-500/20 text-green-300',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Blog Management</h2>
                <button onClick={() => openModal()} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center">
                    <Icon name="plus" className="w-5 h-5 mr-2" />
                    New Post
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-slate-700 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="p-3">Title</th>
                            <th className="p-3">Author</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-center">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogPosts.map(post => (
                            <tr key={post.id} className="border-b border-slate-800 hover:bg-slate-700/50 text-sm">
                                <td className="p-3 font-medium">{post.title}</td>
                                <td className="p-3 text-slate-400">{post.authorName}</td>
                                <td className="p-3 text-slate-400">{new Date(post.createdAt).toLocaleDateString()}</td>
                                <td className="p-3 text-center">{getStatusBadge(post.status)}</td>
                                <td className="p-3 text-center space-x-2">
                                    <button onClick={() => openModal(post)} className="text-yellow-400 font-semibold text-xs">Edit</button>
                                    <button onClick={() => handleDelete(post.id)} className="text-rose-400 font-semibold text-xs">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
                    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-white">{editingPost ? 'Edit Post' : 'Create New Post'}</h3>
                        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                            <input name="title" placeholder="Post Title" value={formData.title} onChange={handleFormChange} required className="w-full bg-slate-700 p-2 rounded-md" />
                            <textarea name="content" placeholder="Post content (Markdown supported)" value={formData.content} onChange={handleFormChange} rows={10} required className="w-full bg-slate-700 p-2 rounded-md font-mono text-sm" />
                            <input name="featuredImage" placeholder="Featured Image URL (optional)" value={formData.featuredImage} onChange={handleFormChange} className="w-full bg-slate-700 p-2 rounded-md" />
                            <select name="status" value={formData.status} onChange={handleFormChange} className="w-full bg-slate-700 p-2 rounded-md">
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                            </select>
                        </div>
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700">
                            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 font-semibold">{editingPost ? 'Save Changes' : 'Create Post'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;
