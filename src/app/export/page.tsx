"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Copy, Check, Sparkles, RefreshCw, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';

export default function ExportPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [imageData, setImageData] = useState<string | null>(null);
    const [caption, setCaption] = useState('');
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('informative');
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [usedModel, setUsedModel] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('temp_export_image');
        if (data) {
            setImageData(data);
        }
    }, []);

    const handleGenerate = async () => {
        if (!topic) return;

        setGenerating(true);
        setCaption('');
        setUsedModel('');

        try {
            const res = await api.generateCaption(topic, tone);
            if (res.status === 'success' && res.data) {
                setCaption(res.data.caption);
                setUsedModel(res.data.model);
            } else {
                setCaption(res.message || 'Failed to generate caption.');
            }
        } catch (error: any) {
            setCaption(error.response?.data?.message || 'Failed to generate. Check API keys in Admin.');
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

    const tones = [
        { id: 'informative', label: '📚 Informative' },
        { id: 'friendly', label: '😊 Friendly' },
        { id: 'professional', label: '💼 Professional' },
        { id: 'fun', label: '🎉 Fun' },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="glass border-b border-slate-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <h1 className="font-bold">Export & Caption</h1>

                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
                {/* Image Preview */}
                <div className="glass rounded-3xl p-4 animate-scale-in">
                    {imageData ? (
                        <img
                            src={imageData}
                            alt="Export Preview"
                            className="w-full rounded-2xl shadow-lg"
                        />
                    ) : (
                        <div className="aspect-[4/5] flex items-center justify-center text-muted rounded-2xl bg-surface">
                            No image to export
                        </div>
                    )}
                </div>

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={!imageData}
                    className="w-full gradient-bg py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover-scale disabled:opacity-50 text-white"
                >
                    <Download className="w-5 h-5" />
                    Download Image
                </button>

                {/* AI Caption Section */}
                <div className="glass rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold">AI Caption Generator</h2>
                            <p className="text-xs text-muted">Powered by Gemini (auto-rotation)</p>
                        </div>
                    </div>

                    {/* Topic Input */}
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Briefly describe your content..."
                        className="w-full px-4 py-3 rounded-xl bg-surface border border-slate-700 focus:border-indigo-500 outline-none transition-all"
                    />

                    {/* Tone Selection */}
                    <div className="flex gap-2 flex-wrap">
                        {tones.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTone(t.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${tone === t.id
                                    ? 'gradient-bg text-white'
                                    : 'glass-light hover:bg-slate-700/50'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!topic || generating}
                        className="w-full gradient-bg py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover-scale disabled:opacity-50 text-white"
                    >
                        {generating ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate Caption
                            </>
                        )}
                    </button>

                    {/* Caption Result */}
                    {caption && (
                        <div className="relative animate-slide-up">
                            <div className="bg-surface rounded-xl p-4 pr-12 whitespace-pre-wrap text-sm border border-slate-700/50">
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
                            {usedModel && (
                                <p className="text-xs text-muted mt-2 text-right">
                                    Model: {usedModel}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
