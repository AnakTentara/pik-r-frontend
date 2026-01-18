"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Image as ImageIcon, Type, Layers, Download, LayoutTemplate, X, Trash2, Save, Check, Undo, Redo } from 'lucide-react';
import * as fabric from 'fabric';
import { api } from '@/lib/api';

export default function EditorPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.id as string;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [projectName, setProjectName] = useState('Loading...');
    const [projectType, setProjectType] = useState('poster');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [templates, setTemplates] = useState<any[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [hasSelection, setHasSelection] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Get ratio based on project type
    const getRatio = (type: string) => {
        switch (type) {
            case 'story': return 9 / 16;
            case 'carousel': return 1;
            default: return 4 / 5;
        }
    };

    // Load project data
    useEffect(() => {
        loadProject();
        loadTemplates();
    }, [projectId]);

    const loadProject = async () => {
        try {
            const res = await api.getProject(projectId);
            if (res.status === 'success' && res.data) {
                setProjectName(res.data.name);
                setProjectType(res.data.type);
                setLoading(false);
            }
        } catch (error) {
            console.error('Failed to load project');
            router.push('/');
        }
    };

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

    // Initialize canvas after project loads
    useEffect(() => {
        if (loading || !canvasRef.current || !containerRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const ratio = getRatio(projectType);

        let canvasWidth, canvasHeight;
        if (containerWidth / containerHeight > ratio) {
            canvasHeight = Math.min(containerHeight - 40, 600);
            canvasWidth = canvasHeight * ratio;
        } else {
            canvasWidth = Math.min(containerWidth - 40, 400);
            canvasHeight = canvasWidth / ratio;
        }

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

        // Auto-save on canvas changes
        fabricCanvas.on('object:modified', () => triggerAutoSave(fabricCanvas));
        fabricCanvas.on('object:added', () => triggerAutoSave(fabricCanvas));
        fabricCanvas.on('object:removed', () => triggerAutoSave(fabricCanvas));

        // Load existing content
        loadCanvasContent(fabricCanvas);

        return () => {
            fabricCanvas.dispose();
        };
    }, [loading, projectType]);

    const loadCanvasContent = async (fabricCanvas: fabric.Canvas) => {
        try {
            const res = await api.getProject(projectId);
            if (res.status === 'success' && res.data?.content?.objects) {
                // Load saved objects
                const objects = res.data.content.objects;
                for (const obj of objects) {
                    if (obj.type === 'image') {
                        const img = await fabric.FabricImage.fromURL(obj.src);
                        img.set(obj);
                        fabricCanvas.add(img);
                    } else if (obj.type === 'i-text') {
                        const text = new fabric.IText(obj.text, obj);
                        fabricCanvas.add(text);
                    }
                }
                fabricCanvas.requestRenderAll();
            }
        } catch (error) {
            console.error('Failed to load canvas content');
        }
    };

    const triggerAutoSave = useCallback((fabricCanvas: fabric.Canvas) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            saveProject(fabricCanvas);
        }, 2000);
    }, [projectId]);

    const saveProject = async (fabricCanvas: fabric.Canvas) => {
        setSaving(true);
        try {
            const objects = fabricCanvas.getObjects().map(obj => obj.toObject(['src']));
            const thumbnail = fabricCanvas.toDataURL({ format: 'png', quality: 0.3, multiplier: 0.5 });

            await api.updateProject(projectId, {
                content: { objects, version: '1.0' },
                thumbnail
            });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Failed to save project');
        } finally {
            setSaving(false);
        }
    };

    // Handle keyboard delete
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && canvas) {
                const active = canvas.getActiveObject();
                if (active && !(active as any).isEditing) {
                    canvas.remove(active);
                    canvas.requestRenderAll();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvas]);

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double tap to edit', {
            left: canvas.getWidth() / 2 - 100,
            top: canvas.getHeight() / 2 - 20,
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
                imgInstance.set({
                    left: canvas.getWidth() / 2 - (imgInstance.getScaledWidth() / 2),
                    top: canvas.getHeight() / 2 - (imgInstance.getScaledHeight() / 2),
                });
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

    const handleManualSave = () => {
        if (canvas) {
            saveProject(canvas);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading project...</p>
                </div>
            </div>
        );
    }

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
                <div className="flex items-center gap-3">
                    <button onClick={() => router.push('/')} className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="font-medium text-sm">{projectName}</div>
                        <div className="text-xs text-slate-400 capitalize">{projectType}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Save Status */}
                    <div className="flex items-center gap-1 text-xs text-slate-400 mr-2">
                        {saving ? (
                            <>
                                <div className="w-3 h-3 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-3 h-3 text-green-400" />
                                Saved
                            </>
                        ) : null}
                    </div>

                    <button
                        onClick={handleManualSave}
                        className="p-2 rounded-xl hover:bg-slate-700/50 transition-colors"
                        title="Save"
                    >
                        <Save className="w-5 h-5" />
                    </button>

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
                <div className="flex justify-around py-4">
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
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%231e293b" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%2364748b" font-size="12">No Image</text></svg>';
                                                }}
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
