"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Upload, Trash2, Image as ImageIcon, Plus, X, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadName, setUploadName] = useState('');
    const [uploadCategory, setUploadCategory] = useState('poster');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadTemplates();
        }
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'pikr2024') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Wrong password');
        }
    };

    const loadTemplates = async () => {
        setLoading(true);
        try {
            const res = await api.getTemplates();
            if (res.status === 'success') {
                setTemplates(res.data || []);
            }
        } catch (err) {
            console.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => setUploadPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !uploadName) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('name', uploadName);
            formData.append('category', uploadCategory);
            formData.append('overlay_file', uploadFile);

            const res = await api.uploadTemplate(formData);
            if (res.status === 'success') {
                setShowUploadModal(false);
                setUploadName('');
                setUploadCategory('poster');
                setUploadFile(null);
                setUploadPreview(null);
                loadTemplates();
            }
        } catch (err) {
            console.error('Failed to upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this template?')) return;
        try {
            await api.deleteTemplate(id);
            loadTemplates();
        } catch (err) {
            console.error('Failed to delete');
        }
    };

    // Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-sm glass rounded-3xl p-8 animate-scale-in">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
                    <p className="text-slate-400 text-center mb-6 text-sm">Enter password to manage templates</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            autoFocus
                        />

                        {error && (
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full gradient-bg py-3 rounded-xl font-medium hover-scale"
                        >
                            Login
                        </button>
                    </form>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full mt-4 py-3 rounded-xl glass hover-scale text-sm text-slate-400"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // Admin Dashboard
    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass border-b border-slate-700/50 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <h1 className="font-bold">Template Manager</h1>

                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="gradient-bg px-4 py-2 rounded-xl flex items-center gap-2 hover-scale text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Upload</span>
                    </button>
                </div>
            </header>

            {/* Template Grid */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] glass rounded-2xl animate-shimmer" />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl animate-fade-in">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-light flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Templates</h3>
                        <p className="text-slate-400 mb-6">Upload your first overlay template</p>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="gradient-bg px-6 py-3 rounded-xl font-medium hover-scale inline-flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Template
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {templates.map((template, idx) => (
                            <div
                                key={template.id}
                                className="group relative glass rounded-2xl overflow-hidden hover-lift animate-slide-up"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="aspect-[4/5] bg-slate-800/50 relative">
                                    <img
                                        src={template.image_path}
                                        alt={template.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                <div className="p-3">
                                    <h4 className="font-medium truncate">{template.name}</h4>
                                    <p className="text-xs text-slate-400 capitalize">{template.category}</p>
                                </div>

                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="glass w-full max-w-md sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                            <h2 className="text-xl font-bold">Upload Template</h2>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {/* File Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[4/5] rounded-2xl border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                            >
                                {uploadPreview ? (
                                    <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 mb-3 text-slate-500" />
                                        <span className="text-slate-400 text-sm">Click to select image</span>
                                        <span className="text-slate-500 text-xs mt-1">PNG with transparency</span>
                                    </>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png"
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            {/* Name Input */}
                            <input
                                type="text"
                                value={uploadName}
                                onChange={(e) => setUploadName(e.target.value)}
                                placeholder="Template Name"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            />

                            {/* Category Select */}
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            >
                                <option value="poster">Poster</option>
                                <option value="carousel">Carousel</option>
                                <option value="story">Story</option>
                            </select>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={!uploadFile || !uploadName || uploading}
                                className="w-full gradient-bg py-3 rounded-xl font-medium hover-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Upload Template
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
