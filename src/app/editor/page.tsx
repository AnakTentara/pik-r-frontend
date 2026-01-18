"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Image as ImageIcon, Type, Layers, Download, LayoutTemplate, X, Trash2 } from 'lucide-react';
import * as fabric from 'fabric';
import { api } from '@/lib/api';

export default function EditorPage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [slides, setSlides] = useState([{ id: 1, type: 'poster', ratio: 4 / 5 }]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [hasSelection, setHasSelection] = useState(false);

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const ratio = slides[activeSlideIndex].ratio;
        const canvasWidth = Math.min(containerWidth - 32, 500);
        const canvasHeight = canvasWidth / ratio;

        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#1E293B',
            preserveObjectStacking: true,
        });

        setCanvas(fabricCanvas);

        fabricCanvas.on('selection:created', () => setHasSelection(true));
        fabricCanvas.on('selection:updated', () => setHasSelection(true));
        fabricCanvas.on('selection:cleared', () => setHasSelection(false));

        return () => {
            fabricCanvas.dispose();
        };
    }, [activeSlideIndex, slides]);

    // Load templates
    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await api.getTemplates();
            if (res.status === 'success') {
                setTemplates(res.data || []);
            }
        } catch (error) {
            console.error('Failed to load templates');
        }
    };

    // Handle keyboard delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
                const active = canvas.getActiveObject();
                if (active) {
                    canvas.remove(active);
                    canvas.requestRenderAll();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvas]);

    const addSlide = () => {
        const newSlide = { id: slides.length + 1, type: 'poster', ratio: 4 / 5 };
        setSlides([...slides, newSlide]);
        setActiveSlideIndex(slides.length);
    };

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double tap to edit', {
            left: 50,
            top: 50,
            fontFamily: 'Inter',
            fontSize: 32,
            fill: '#FFFFFF',
            fontWeight: 'bold',
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !canvas) return;

        const reader = new FileReader();
        reader.onload = (f) => {
            const imgObj = new Image();
            imgObj.src = f.target?.result as string;
            imgObj.onload = () => {
                const imgInstance = new fabric.FabricImage(imgObj);
                if (imgInstance.width! > canvas.getWidth()) {
                    imgInstance.scaleToWidth(canvas.getWidth() * 0.8);
                }
                canvas.add(imgInstance);
                canvas.sendObjectToBack(imgInstance);
                canvas.setActiveObject(imgInstance);
                canvas.requestRenderAll();
            };
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyTemplate = async (template: any) => {
        if (!canvas) return;

        try {
            const img = await fabric.FabricImage.fromURL(template.image_path, { crossOrigin: 'anonymous' });
            if (!img) return;

            const scale = canvas.getWidth() / img.width;
            img.scale(scale);
            img.set({
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                evented: false,
                selectable: false
            });

            canvas.overlayImage = img;
            canvas.requestRenderAll();
            setShowTemplateModal(false);
        } catch (error) {
            console.error('Failed to apply template', error);
        }
    };

    const deleteSelected = () => {
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (active) {
            canvas.remove(active);
            canvas.requestRenderAll();
        }
    };

    const handleExport = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
        localStorage.setItem('temp_export_image', dataURL);
        router.push('/export');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />

            {/* Header */}
            <header className="glass border-b border-slate-700/50 px-4 py-3 flex items-center justify-between z-10">
                <button onClick={() => router.push('/')} className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="text-sm font-medium">
                    Slide {activeSlideIndex + 1} / {slides.length}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                    >
                        <LayoutTemplate className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="gradient-bg px-4 py-2 rounded-xl flex items-center gap-2 hover-scale text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </header>

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="flex-1 flex items-center justify-center p-4 overflow-auto"
            >
                <div className="relative shadow-2xl rounded-2xl overflow-hidden animate-scale-in">
                    <canvas ref={canvasRef} />
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="glass border-t border-slate-700/50 safe-area-bottom">
                {/* Action Buttons */}
                <div className="flex justify-around py-4 border-b border-slate-700/30">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
                    >
                        <div className="w-12 h-12 glass-light rounded-2xl flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <span className="text-xs">Photo</span>
                    </button>

                    <button
                        onClick={addText}
                        className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
                    >
                        <div className="w-12 h-12 glass-light rounded-2xl flex items-center justify-center">
                            <Type className="w-5 h-5" />
                        </div>
                        <span className="text-xs">Text</span>
                    </button>

                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors active:scale-95"
                    >
                        <div className="w-12 h-12 glass-light rounded-2xl flex items-center justify-center">
                            <Layers className="w-5 h-5" />
                        </div>
                        <span className="text-xs">Template</span>
                    </button>

                    {hasSelection && (
                        <button
                            onClick={deleteSelected}
                            className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors active:scale-95"
                        >
                            <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <span className="text-xs">Delete</span>
                        </button>
                    )}
                </div>

                {/* Slide Thumbnails */}
                <div className="flex gap-3 p-4 overflow-x-auto">
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`flex-shrink-0 w-14 h-18 rounded-xl border-2 flex items-center justify-center transition-all ${activeSlideIndex === idx
                                    ? 'border-indigo-500 bg-indigo-500/20 -translate-y-1'
                                    : 'border-slate-600 glass-light'
                                }`}
                        >
                            <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        </button>
                    ))}

                    <button
                        onClick={addSlide}
                        className="flex-shrink-0 w-14 h-18 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center hover:border-indigo-500 hover:text-indigo-400 transition-all text-slate-500"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="glass w-full max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[80vh] flex flex-col animate-slide-up">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                            <h2 className="text-lg font-bold">Select Template</h2>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                            {templates.length === 0 ? (
                                <p className="col-span-2 text-center text-slate-400 py-10">No templates. Go to Admin to upload.</p>
                            ) : (
                                templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => applyTemplate(tpl)}
                                        className="glass-light rounded-xl overflow-hidden hover-scale text-left"
                                    >
                                        <div className="aspect-[4/5] bg-slate-800/50">
                                            <img
                                                src={tpl.image_path}
                                                alt={tpl.name}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="p-2">
                                            <div className="font-medium text-sm truncate">{tpl.name}</div>
                                            <div className="text-xs text-slate-400 capitalize">{tpl.category}</div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
