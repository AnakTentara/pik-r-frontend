"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Copy, Check, Sparkles, RefreshCw, Key, X } from 'lucide-react';
import { generateCaption } from '@/lib/gemini';

export default function ExportPage() {
    const router = useRouter();
    const [imageData, setImageData] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('informative');
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showApiModal, setShowApiModal] = useState(false);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('temp_export_image');
        if (data) {
            setImageData(data);
        }
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleGenerate = async () => {
        if (!topic) return;

        const key = localStorage.getItem('gemini_api_key');
        if (!key) {
            setShowApiModal(true);
            return;
        }

        setGenerating(true);
        try {
            const result = await generateCaption(topic, tone, key);
            setCaption(result);
        } catch (error) {
            console.error('Failed to generate caption');
            setCaption('Failed to generate. Please check your API key.');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!caption) return;
        await navigator.clipboard.writeText(caption);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!imageData) return;
        const link = document.createElement('a');
        link.download = `pikr-content-${Date.now()}.png`;
        link.href = imageData;
        link.click();
    };

    const saveApiKey = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setShowApiModal(false);
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass border-b border-slate-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => router.push('/editor')} className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <h1 className="font-bold">Export</h1>

                <button
                    onClick={() => setShowApiModal(true)}
                    className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                    <Key className="w-5 h-5" />
                </button>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
                {/* Image Preview */}
                <div className="glass rounded-3xl p-4 animate-scale-in">
                    {imageData ? (
                        <img
                            src={imageData}
                            alt="Export Preview"
                            className="w-full rounded-2xl shadow-lg"
                        />
                    ) : (
                        <div className="aspect-[4/5] flex items-center justify-center text-slate-400">
                            No image to export
                        </div>
                    )}
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={!imageData}
                    className="w-full gradient-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover-scale disabled:opacity-50"
                >
                    <Download className="w-5 h-5" />
                    Download Image
                </button>

                {/* AI Caption Section */}
                <div className="glass rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-bold">AI Caption</h2>
                            <p className="text-xs text-slate-400">Generate caption with Gemini AI</p>
                        </div>
                    </div>

                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="What's your content about?"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                    />

                    <div className="flex gap-2 flex-wrap">
                        {['informative', 'friendly', 'professional', 'fun'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTone(t)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tone === t
                                        ? 'gradient-bg'
                                        : 'glass-light hover:bg-slate-700/50'
                                    }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={!topic || generating}
                        className="w-full glass-light py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-700/50 transition-all disabled:opacity-50"
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Generate Caption
                            </>
                        )}
                    </button>

                    {caption && (
                        <div className="relative animate-slide-up">
                            <div className="bg-slate-800/50 rounded-xl p-4 pr-12 whitespace-pre-wrap text-sm">
                                {caption}
                            </div>
                            <button
                                onClick={handleCopy}
                                className="absolute top-3 right-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* API Key Modal */}
            {showApiModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass w-full max-w-sm rounded-3xl p-6 animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Gemini API Key</h2>
                            <button
                                onClick={() => setShowApiModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-slate-400 mb-4">
                            Get your API key from{' '}
                            <a href="https://aistudio.google.com/apikey" target="_blank" className="text-indigo-400 underline">
                                Google AI Studio
                            </a>
                        </p>

                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter your API key"
                            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all mb-4"
                        />

                        <button
                            onClick={saveApiKey}
                            disabled={!apiKey}
                            className="w-full gradient-bg py-3 rounded-xl font-medium hover-scale disabled:opacity-50"
                        >
                            Save Key
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
