"use client";

import React, { useState, useEffect, useRef } from 'react';
import CanvasEditor from './CanvasEditor';
import { ArrowLeft, Plus, Image as ImageIcon, Type, Layers, Download, LayoutTemplate } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as fabric from 'fabric';
import { api } from '@/lib/api';
import { API_URL } from '@/lib/config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Editor = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [slides, setSlides] = useState([
        { id: 1, type: 'poster', ratio: 4 / 5, content: null }
    ]);
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const activeSlide = slides[activeSlideIndex];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            const res = await api.getTemplates();
            if (res.status === 'success') {
                setTemplates(res.data);
            }
        } catch (error) {
            console.error("Failed to load templates");
        }
    };

    const handleAddSlide = () => {
        const newSlide = {
            id: slides.length + 1,
            type: 'poster',
            ratio: 4 / 5,
            content: null
        };
        setSlides([...slides, newSlide]);
        setActiveSlideIndex(slides.length);
    };

    const handleCanvasReady = (fabricCanvas: fabric.Canvas) => {
        setCanvas(fabricCanvas);

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const active = fabricCanvas.getActiveObject();
                if (active) {
                    fabricCanvas.remove(active);
                }
            }
        });
    };

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double click to edit', {
            left: 50,
            top: 50,
            fontFamily: 'Arial',
            fontSize: 40,
            fill: '#333',
            fontWeight: 'bold',
        });
        canvas.add(text);
        canvas.setActiveObject(text);
    };

    const triggerImageUpload = () => {
        fileInputRef.current?.click();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleImageUpload = (e: any) => {
        const file = e.target.files[0];
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
                canvas.renderAll();
            };
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyTemplate = async (template: any) => {
        if (!canvas) return;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const baseUrl = API_URL.replace('api.php', '');
        const imageUrl = `${baseUrl}${template.image_path}`;

        try {
            const img = await fabric.FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
            if (!img) return;

            // Scale to fit canvas width
            const scale = canvas.getWidth() / img.width;
            img.scale(scale);

            // Center the overlay
            img.set({
                left: 0,
                top: 0,
                originX: 'left',
                originY: 'top',
                evented: false, // Make overlay unclickable so we can select objects behind it
                selectable: false
            });

            // In Fabric v6, use overlayImage property
            canvas.overlayImage = img;
            canvas.requestRenderAll();

            setShowTemplateModal(false);
        } catch (error) {
            console.error("Failed to load template", error);
        }
    };

    const handleExport = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({ format: 'png', quality: 0.8, multiplier: 2 });

        // Save to localStorage to pass to Export page (since no state in navigation)
        localStorage.setItem('temp_export_image', dataURL);
        router.push('/export');
    };

    return (
        <div className="flex flex-col h-screen bg-slate-100">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />

            <header className="bg-white p-3 flex justify-between items-center shadow-sm z-10 px-4">
                <button onClick={() => router.push('/')} className="p-2 hover:bg-slate-100 rounded-full">
                    <ArrowLeft size={24} className="text-slate-700" />
                </button>
                <div className="font-semibold text-slate-800">
                    Slide {activeSlideIndex + 1} / {slides.length}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="p-2 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-200"
                    >
                        <LayoutTemplate size={18} /> <span className="hidden sm:inline">Templates</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 bg-primary text-white font-bold flex items-center gap-2 rounded-lg px-4 text-sm hover:bg-indigo-700 shadow-sm"
                    >
                        Export <Download size={18} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-hidden relative touch-none">
                <CanvasEditor
                    activeSlide={activeSlide}
                    onCanvasReady={handleCanvasReady}
                />
            </div>

            <div className="bg-white border-t border-slate-200 safe-area-bottom">
                <div className="flex justify-around p-3 border-b border-slate-100 pb-4">
                    <button onClick={triggerImageUpload} className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary active:scale-95 transition">
                        <div className="p-3 bg-slate-100 rounded-full"><ImageIcon size={20} /></div>
                        <span className="text-xs font-medium">Add Photo</span>
                    </button>
                    <button onClick={addText} className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary active:scale-95 transition">
                        <div className="p-3 bg-slate-100 rounded-full"><Type size={20} /></div>
                        <span className="text-xs font-medium">Add Text</span>
                    </button>
                    <button onClick={() => setShowTemplateModal(true)} className="flex flex-col items-center gap-1 text-slate-600 hover:text-primary active:scale-95 transition">
                        <div className="p-3 bg-slate-100 rounded-full"><Layers size={20} /></div>
                        <span className="text-xs font-medium">Template</span>
                    </button>
                </div>

                <div className="p-4 flex gap-3 overflow-x-auto bg-slate-50 border-t border-slate-200">
                    {slides.map((slide, idx) => (
                        <button
                            key={slide.id}
                            onClick={() => setActiveSlideIndex(idx)}
                            className={`relative flex-shrink-0 w-16 h-20 rounded-lg border-2 flex items-center justify-center bg-white shadow-sm transition-all ${activeSlideIndex === idx ? 'border-primary ring-2 ring-indigo-200 -translate-y-1' : 'border-slate-200'
                                }`}
                        >
                            <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        </button>
                    ))}

                    <button
                        onClick={handleAddSlide}
                        className="flex-shrink-0 w-16 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-white hover:border-primary text-slate-300 hover:text-primary transition"
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-white w-full max-w-lg sm:rounded-xl rounded-t-xl h-[80vh] flex flex-col shadow-2xl animate-slide-up">
                        <header className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Select Template</h3>
                            <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-800">Close</button>
                        </header>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 bg-slate-50">
                            {templates.length === 0 && <p className="text-center col-span-2 text-slate-500 mt-10">No templates found. Go to Admin to upload.</p>}
                            {templates.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => applyTemplate(tpl)}
                                    className="bg-white p-2 rounded-lg border hover:border-primary hover:shadow-lg transition group text-left"
                                >
                                    <div className="aspect-[4/5] bg-slate-200 mb-2 overflow-hidden rounded-md relative">
                                        <img
                                            src={`${API_URL.replace('api.php', '')}${tpl.image_path}`}
                                            className="w-full h-full object-cover"
                                            alt={tpl.name}
                                        />
                                    </div>
                                    <div className="font-medium text-sm truncate">{tpl.name}</div>
                                    <div className="text-xs text-slate-400 capitalize">{tpl.category}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editor;
