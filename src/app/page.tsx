"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layers, Settings, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      if (res.status === 'success') {
        setProjects(res.data || []);
      }
    } catch (error) {
      console.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">PIK-R Creator</span>
          </div>

          <button
            onClick={() => router.push('/admin')}
            className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover-scale text-sm font-medium"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </nav>

        <div className="relative z-10 text-center py-16 px-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 text-sm text-slate-300">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI-Powered Content Creation
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-4">
            Create <span className="gradient-text">Stunning</span> Content
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Design beautiful posters, carousels, and stories for your social media with professional templates and AI captions.
          </p>

          <button
            onClick={() => router.push('/editor')}
            className="gradient-bg px-8 py-4 rounded-2xl font-bold text-lg hover-scale inline-flex items-center gap-3 animate-pulse-glow"
          >
            Start Creating
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Projects</h2>
          <button
            onClick={() => router.push('/editor')}
            className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover-scale text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] glass rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center animate-float">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-slate-400 mb-6">Create your first stunning content now!</p>
            <button
              onClick={() => router.push('/editor')}
              className="gradient-bg px-6 py-3 rounded-xl font-medium hover-scale inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project, idx) => (
              <button
                key={project.id}
                className="group relative aspect-[4/5] glass rounded-2xl overflow-hidden hover-lift animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
                onClick={() => router.push('/editor')}
              >
                <div className="absolute inset-0 gradient-bg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Layers className="w-8 h-8 mb-3 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="font-medium text-center">{project.name}</span>
                  <span className="text-xs text-slate-400 mt-1 capitalize">{project.type}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => router.push('/editor')}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-bg rounded-full flex items-center justify-center shadow-2xl hover-scale animate-pulse-glow sm:hidden z-50"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
}
