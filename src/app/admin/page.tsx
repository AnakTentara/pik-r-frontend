"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Upload, Trash2, Image as ImageIcon, Plus, X, Check, Key, Sun, Moon, LayoutTemplate, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';
import { useConfirm } from '@/lib/confirm';

export default function AdminPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { confirm } = useConfirm();
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
    const [removeBgKey, setRemoveBgKey] = useState('');
    const [savingKeys, setSavingKeys] = useState(false);
    const [keysSaved, setKeysSaved] = useState(false);
    const [isKeysLocked, setIsKeysLocked] = useState(true);

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
                setRemoveBgKey(res.data.remove_bg_key || '');
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
                api_key_3: apiKey3,
                remove_bg_key: removeBgKey
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
        const confirmed = await confirm({
            title: 'Delete Template',
            message: 'Are you sure you want to delete this template? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            danger: true
        });

        if (!confirmed) return;

        try {
            await api.deleteTemplate(id);
            loadTemplates();
        } catch (err) {
            console.error('Failed to delete');
        }
    };

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

    return (
        <div className="min-h-screen">
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
                <section className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                                <LayoutTemplate className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">Templates Grid</h2>
                                <p className="text-xs text-muted">Manage overlay templates</p>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="aspect-[4/5] glass rounded-2xl animate-shimmer" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {templates.map((template) => (
                                <div key={template.id} className="group relative aspect-[4/5] glass rounded-2xl overflow-hidden hover-lift">
                                    <img
                                        src={template.image_path}
                                        alt={template.name}
                                        className="w-full h-full object-contain bg-slate-800/50"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                        <div className="text-white text-xs font-medium truncate w-full">{template.name}</div>
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

                <section className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                                <Key className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold">API Keys</h2>
                                <p className="text-xs text-muted">Manage external service keys</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsKeysLocked(!isKeysLocked)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isKeysLocked ? 'glass-light text-muted' : 'bg-indigo-500/20 text-indigo-400'
                                }`}
                        >
                            {isKeysLocked ? <Lock className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            {isKeysLocked ? 'Unlock to Edit' : 'Cancel Editing'}
                        </button>
                    </div>

                    <div className="grid gap-3 mb-4">
                        {[
                            { value: apiKey1, setter: setApiKey1, label: 'Gemini Key 1' },
                            { value: apiKey2, setter: setApiKey2, label: 'Gemini Key 2' },
                            { value: apiKey3, setter: setApiKey3, label: 'Gemini Key 3' },
                        ].map((key, i) => (
                            <div key={i} className="relative">
                                <input
                                    type="password"
                                    value={key.value}
                                    onChange={(e) => key.setter(e.target.value)}
                                    placeholder={key.label}
                                    readOnly={isKeysLocked}
                                    className={`w-full px-4 py-3 rounded-xl bg-surface border outline-none transition-all ${isKeysLocked ? 'border-slate-800/50 opacity-60' : 'border-slate-700 focus:border-indigo-500'
                                        }`}
                                />
                                {isKeysLocked && <div className="absolute inset-0 z-10" />}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-pink-400" />
                            Remove.bg API Key
                        </h3>
                        <div className="relative">
                            <input
                                type="password"
                                value={removeBgKey}
                                onChange={(e) => setRemoveBgKey(e.target.value)}
                                placeholder="Remove.bg API Key"
                                readOnly={isKeysLocked}
                                className={`w-full px-4 py-3 rounded-xl bg-surface border outline-none transition-all ${isKeysLocked ? 'border-slate-800/50 opacity-60' : 'border-slate-700 focus:border-pink-500'
                                    }`}
                            />
                            {isKeysLocked && <div className="absolute inset-0 z-10" />}
                        </div>
                    </div>

                    {!isKeysLocked && (
                        <button
                            onClick={saveApiKeys}
                            disabled={savingKeys}
                            className="mt-6 gradient-bg px-6 py-2 rounded-xl font-medium hover-scale text-white flex items-center gap-2"
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
                    )}
                </section>
            </main>

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
