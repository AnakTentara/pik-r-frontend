"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Trash2, Upload, Lock, ArrowLeft } from 'lucide-react';
import { API_URL } from '@/lib/config';
import { useRouter } from 'next/navigation';

export default function Admin() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('portrait');
    const [newFile, setNewFile] = useState<File | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadTemplates();
        }
    }, [isAuthenticated]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleLogin = (e: any) => {
        e.preventDefault();
        if (password === 'pikr2024') {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.getTemplates();
            if (res.status === 'success') {
                setTemplates(res.data);
            }
        } catch (error) {
            console.error("Failed to load templates", error);
        } finally {
            setLoading(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleUpload = async (e: any) => {
        e.preventDefault();
        if (!newFile || !newName) return;

        const formData = new FormData();
        formData.append('name', newName);
        formData.append('category', newCategory);
        formData.append('overlay_file', newFile);

        try {
            await api.uploadTemplate(formData);
            alert('Upload successful!');
            setNewName('');
            setNewFile(null);
            loadTemplates();
        } catch (error) {
            alert('Upload failed');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;
        try {
            await api.deleteTemplate(id);
            loadTemplates();
        } catch (error) {
            alert('Delete failed');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-100 flex-col">
                <button onClick={() => router.push('/')} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={16} /> Back to Home
                </button>
                <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <div className="flex justify-center mb-4 text-primary">
                        <Lock size={48} />
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
                    <input
                        type="password"
                        className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                        Login
                    </button>
                    <p className="mt-4 text-xs text-center text-slate-400">Password is pikr2024</p>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-200 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-3xl font-bold text-slate-800">Template Manager</h1>
                    </div>
                    <button onClick={() => setIsAuthenticated(false)} className="text-sm text-slate-500 hover:text-red-500">
                        Logout
                    </button>
                </header>

                {/* Upload Section */}
                <section className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-slate-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Upload size={20} /> Upload New Overlay
                    </h2>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Template Name"
                                className="p-3 border rounded-lg w-full"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                required
                            />
                            <select
                                className="p-3 border rounded-lg w-full bg-white"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                            >
                                <option value="portrait">Portrait (4:5)</option>
                                <option value="story">Story (9:16)</option>
                                <option value="carousel">Carousel (4:5)</option>
                            </select>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setNewFile(e.target.files ? e.target.files[0] : null)}
                                required
                            />
                            <p className="text-slate-500">
                                {newFile ? newFile.name : "Click to select PNG file"}
                            </p>
                        </div>
                        <button className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition">
                            Upload Template
                        </button>
                    </form>
                </section>

                {/* List Section */}
                <section>
                    <h2 className="text-lg font-semibold mb-4 text-slate-700">Existing Templates</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {templates.length === 0 && <p className="text-slate-400 col-span-full">No templates found.</p>}
                            {templates.map(tpl => (
                                <div key={tpl.id} className="bg-white rounded-lg shadow-sm overflow-hidden group relative border border-slate-200">
                                    <div className="aspect-[4/5] bg-slate-100 relative">
                                        <img
                                            src={`${API_URL.replace('api.php', '')}${tpl.image_path}`}
                                            alt={tpl.name}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-slate-800 truncate">{tpl.name}</h3>
                                        <p className="text-xs text-slate-500 uppercase">{tpl.category}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(tpl.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
