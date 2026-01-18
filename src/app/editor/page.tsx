"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Image, Layout, Film, X } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewEditorPage() {
    const router = useRouter();
    const [showModal, setShowModal] = useState(true);
    const [projectName, setProjectName] = useState('');
    const [projectType, setProjectType] = useState('poster');
    const [creating, setCreating] = useState(false);

    const projectTypes = [
        { id: 'poster', name: 'Poster', icon: Image, ratio: '4:5', desc: 'Instagram post' },
        { id: 'carousel', name: 'Carousel', icon: Layout, ratio: '1:1', desc: 'Multi-slide post' },
        { id: 'story', name: 'Story', icon: Film, ratio: '9:16', desc: 'Instagram story' },
    ];

    const handleCreate = async () => {
        if (!projectName.trim()) return;

        setCreating(true);
        try {
            const res = await api.createProject({
                name: projectName.trim(),
                type: projectType
            });

            if (res.status === 'success' && res.data?.id) {
                router.push(`/editor/${res.data.id}`);
            }
        } catch (error) {
            console.error('Failed to create project');
            setCreating(false);
        }
    };

    const handleClose = () => {
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            {showModal && (
                <div className="glass w-full max-w-md rounded-3xl animate-scale-in overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
                        <h2 className="text-xl font-bold">New Project</h2>
                        <button
                            onClick={handleClose}
                            className="w-8 h-8 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Project Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Project Name</label>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="My Awesome Poster"
                                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Project Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-3">Content Type</label>
                            <div className="grid grid-cols-3 gap-3">
                                {projectTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setProjectType(type.id)}
                                            className={`p-4 rounded-xl border-2 transition-all text-center ${projectType === type.id
                                                    ? 'border-indigo-500 bg-indigo-500/20'
                                                    : 'border-slate-700 glass-light hover:border-slate-600'
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 mx-auto mb-2 ${projectType === type.id ? 'text-indigo-400' : 'text-slate-400'}`} />
                                            <div className="font-medium text-sm">{type.name}</div>
                                            <div className="text-xs text-slate-500">{type.ratio}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Create Button */}
                        <button
                            onClick={handleCreate}
                            disabled={!projectName.trim() || creating}
                            className="w-full gradient-bg py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creating ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Create Project
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
