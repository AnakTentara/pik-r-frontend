"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Sparkles, Save } from 'lucide-react';
import { generateCaption } from '@/lib/gemini';

export default function Export() {
    const router = useRouter();
    const [image, setImage] = useState<string | null>(null);

    // AI State
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Fun & Youthful');
    const [caption, setCaption] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(false);

    useEffect(() => {
        // Load image from localStorage since we can't pass large state via query params easily
        const storedImage = localStorage.getItem('temp_export_image');
        if (storedImage) {
            setImage(storedImage);
        } else {
            router.push('/');
        }

        const key = localStorage.getItem('gemini_api_key');
        if (key) setApiKey(key);
        else setShowKeyInput(true);
    }, [router]);

    const handleGenerate = async () => {
        if (!apiKey) {
            alert("Please enter a valid Gemini API Key");
            setShowKeyInput(true);
            return;
        }

        // Save key
        localStorage.setItem('gemini_api_key', apiKey);

        setLoading(true);
        try {
            const result = await generateCaption(apiKey, topic || "Activity documentation", tone);
            setCaption(result);
        } catch (error) {
            alert("Failed to generate caption. Check your API Key.");
        } finally {
            setLoading(false);
        }
    };

    const copyCaption = () => {
        navigator.clipboard.writeText(caption);
        alert("Caption copied!");
    };

    const handleDownload = () => {
        if (!image) return;
        const link = document.createElement('a');
        link.download = `pikr-post-${Date.now()}.png`;
        link.href = image;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white p-4 shadow-sm flex items-center gap-4">
                <button onClick={() => router.push('/editor')} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={24} className="text-slate-700" />
                </button>
                <h1 className="font-bold text-lg text-slate-800">Export & Share</h1>
            </header>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Image Preview */}
                    <div className="flex flex-col gap-4">
                        <h2 className="font-semibold text-slate-600">Result</h2>
                        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                            {image && <img src={image} alt="Generated Content" className="w-full h-auto rounded-lg" />}
                        </div>
                        <button
                            onClick={handleDownload}
                            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition"
                        >
                            <Save size={20} /> Save Image
                        </button>
                    </div>

                    {/* AI Caption */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-slate-600">AI Caption Generator</h2>
                            <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Sparkles size={10} /> GEMINI
                            </span>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            {showKeyInput && (
                                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                                    <p className="mb-2 font-bold">API Key Required</p>
                                    <input
                                        type="text"
                                        placeholder="Paste Google Gemini API Key"
                                        className="w-full p-2 border rounded bg-white"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm text-slate-500 font-medium mb-1 block">Quick Topic / Context</label>
                                <textarea
                                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    rows={3}
                                    placeholder="e.g. Documentation of Youth Counseling workshop regarding mental health..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-sm text-slate-500 font-medium mb-1 block">Tone</label>
                                <select
                                    className="w-full p-3 border rounded-lg bg-white"
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                >
                                    <option value="Fun & Youthful">Fun & Youthful (Emoji heavy, casual)</option>
                                    <option value="Formal & Official">Formal & Official (Professional)</option>
                                    <option value="Inspirational">Inspirational (Motivational quotes)</option>
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? "Generating..." : <><Sparkles size={18} /> Generate Caption</>}
                            </button>

                            {caption && (
                                <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-400">GENERATED CAPTION</span>
                                        <button onClick={copyCaption} className="text-primary text-xs font-bold flex items-center gap-1 hover:bg-slate-50 p-1 rounded">
                                            <Copy size={14} /> COPY
                                        </button>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-relaxed border border-slate-200">
                                        {caption}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
