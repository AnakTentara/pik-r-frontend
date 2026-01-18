"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Upload, Trash2, Image as ImageIcon, Plus, X, Check, Key, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';

export default function AdminPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
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

    const [apiKey1, setApiKey1] = useState('');
    const [apiKey2, setApiKey2] = useState('');
    const [apiKey3, setApiKey3] = useState('');
    const [savingKeys, setSavingKeys] = useState(false);
    const [keysSaved, setKeysSaved] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadTemplates();
            loadSettings();
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

    const loadSettings = async () => {
        try {
            const res = await api.getSettings();
            if (res.status === 'success' && res.data) {
                setApiKey1(res.data.api_key_1 || '');
                setApiKey2(res.data.api_key_2 || '');
                setApiKey3(res.data.api_key_3 || '');
            }
        } catch (err) {
            console.error('Failed to load settings');
        }
    };

    const saveApiKeys = async () => {
        setSavingKeys(true);
        try {
            await api.saveSettings({
                api_key_1: apiKey1,
                api_key_2: apiKey2,
                api_key_3: apiKey3
            });
            setKeysSaved(true);
            setTimeout(() => setKeysSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save API keys');
        } finally {
            setSavingKeys(false);
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
                    <p className="text-muted text-center mb-6 text-sm">Enter password to manage templates</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                            autoFocus
                        />

                        {error && (
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            className="w-full gradient-bg py-3 rounded-xl font-medium hover-scale text-white"
                        >
                            Login
                        </button>
                    </form>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full mt-4 py-3 rounded-xl glass hover-scale text-sm text-muted"
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

                    <h1 className="font-bold">Admin Panel</h1>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="gradient-bg px-4 py-2 rounded-xl flex items-center gap-2 hover-scale text-sm font-medium text-white"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Upload</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* API Keys Section */}
                <section className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                            <Key className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold">Gemini API Keys</h2>
                            <p className="text-xs text-muted">Add up to 3 keys for rotation</p>
                        </div>
                    </div>

                    <div className="grid gap-3 mb-4">
                        <input
                            type="password"
                            value={apiKey1}
                            onChange={(e) => setApiKey1(e.target.value)}
                            placeholder="API Key 1 (Primary)"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                        />
                        <input
                            type="password"
                            value={apiKey2}
                            onChange={(e) => setApiKey2(e.target.value)}
                            placeholder="API Key 2 (Backup)"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                        />
                        <input
                            type="password"
                            value={apiKey3}
                            onChange={(e) => setApiKey3(e.target.value)}
                            placeholder="API Key 3 (Backup)"
                            className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={saveApiKeys}
                        disabled={savingKeys}
                        className="gradient-bg px-6 py-2 rounded-xl font-medium hover-scale text-white flex items-center gap-2"
                    >
                        {savingKeys ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : keysSaved ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Key className="w-4 h-4" />
                        )}
                        {keysSaved ? 'Saved!' : 'Save Keys'}
                    </button>
                </section>

                {/* Template Grid */}
                <section>
                    <h2 className="text-xl font-bold mb-4">Templates</h2>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-[4/5] glass rounded-2xl animate-shimmer" />
                            ))}
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="text-center py-20 glass rounded-3xl animate-fade-in">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full glass-light flex items-center justify-center">
                                <ImageIcon className="w-10 h-10 text-muted" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No Templates</h3>
                            <p className="text-muted mb-6">Upload your first overlay template</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="gradient-bg px-6 py-3 rounded-xl font-medium hover-scale inline-flex items-center gap-2 text-white"
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
                                    <div className="aspect-[4/5] bg-surface relative">
                                        <img
                                            src={template.image_path}
                                            alt={template.name}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2364748b" font-size="10">No Image</text></svg>';
                                            }}
                                        />
                                    </div>

                                    <div className="p-3">
                                        <h4 className="font-medium truncate">{template.name}</h4>
                                        <p className="text-xs text-muted capitalize">{template.category}</p>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(template.id)}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
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
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-[4/5] rounded-2xl border-2 border-dashed border-slate-600 hover:border-indigo-500 transition-colors cursor-pointer flex flex-col items-center justify-center overflow-hidden"
                            >
                                {uploadPreview ? (
                                    <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 mb-3 text-muted" />
                                        <span className="text-muted text-sm">Click to select image</span>
                                        <span className="text-muted/60 text-xs mt-1">PNG with transparency</span>
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

                            <input
                                type="text"
                                value={uploadName}
                                onChange={(e) => setUploadName(e.target.value)}
                                placeholder="Template Name"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                            />

                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="poster">Poster</option>
                                <option value="carousel">Carousel</option>
                                <option value="story">Story</option>
                            </select>

                            <button
                                type="submit"
                                disabled={!uploadFile || !uploadName || uploading}
                                className="w-full gradient-bg py-3 rounded-xl font-medium hover-scale disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white"
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
