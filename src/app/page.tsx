"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Layers, Settings, Sparkles, ArrowRight, Image, Layout, Film, Trash2, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';
import { useConfirm } from '@/lib/confirm';

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { confirm } = useConfirm();
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

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();

    const confirmed = await confirm({
      title: 'Delete Project',
      message: 'Are you sure you want to delete this project? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true
    });

    if (!confirmed) return;

    try {
      await api.deleteProject(id);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story': return Film;
      case 'carousel': return Layout;
      default: return Image;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Glow (dark mode only) */}
        <div className="absolute inset-0 overflow-hidden dark:block hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold block leading-tight">PIK-R Creator</span>
              <span className="text-xs text-muted">Medinfo Content Tool</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="glass p-2 rounded-xl hover-scale"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover-scale text-sm font-medium"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </nav>

        <div className="relative z-10 text-center py-12 px-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 text-sm text-muted">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI-Powered Content Creation
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Create <span className="gradient-text">Stunning</span> Content
          </h1>
          <p className="text-muted max-w-lg mx-auto mb-8">
            Design posters, carousels, and stories with professional templates and AI captions for PIK-R Medinfo.
          </p>

          <button
            onClick={() => router.push('/editor')}
            className="gradient-bg px-8 py-4 rounded-2xl font-bold text-lg hover-scale inline-flex items-center gap-3 animate-pulse-glow text-white"
          >
            Start Creating
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { type: 'poster', name: 'Poster', icon: Image, color: 'from-indigo-500 to-purple-500' },
            { type: 'carousel', name: 'Carousel', icon: Layout, color: 'from-pink-500 to-rose-500' },
            { type: 'story', name: 'Story', icon: Film, color: 'from-amber-500 to-orange-500' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => router.push('/editor')}
                className="glass rounded-2xl p-4 sm:p-6 hover-lift text-center group"
              >
                <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="font-medium">{item.name}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Your Projects</h2>
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
          <div className="text-center py-16 glass rounded-3xl animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg flex items-center justify-center animate-float">
              <Layers className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted mb-6">Create your first content now!</p>
            <button
              onClick={() => router.push('/editor')}
              className="gradient-bg px-6 py-3 rounded-xl font-medium hover-scale inline-flex items-center gap-2 text-white"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project, idx) => {
              const TypeIcon = getTypeIcon(project.type);
              return (
                <button
                  key={project.id}
                  className="group relative glass rounded-2xl overflow-hidden hover-lift animate-slide-up text-left"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => router.push(`/editor/${project.id}`)}
                >
                  <div className="aspect-[4/5] bg-surface relative">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TypeIcon className="w-12 h-12 text-muted" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="p-3">
                    <div className="font-medium truncate">{project.name}</div>
                    <div className="text-xs text-muted capitalize flex items-center gap-1">
                      <TypeIcon className="w-3 h-3" />
                      {project.type}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => router.push('/editor')}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-bg rounded-full flex items-center justify-center shadow-2xl hover-scale animate-pulse-glow sm:hidden z-50"
      >
        <Plus className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
