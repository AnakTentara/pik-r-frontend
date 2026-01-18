"use client";

import React, { useEffect, useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
        setProjects(res.data);
      }
    } catch (error) {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const startNewProject = () => {
    router.push('/editor');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-24">
      <div className="max-w-md mx-auto relative h-full">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              PIK-R
            </h1>
            <p className="text-slate-500 text-sm">Content Creator</p>
          </div>
          <button onClick={() => router.push('/admin')} className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-400"></div>
          </button>
        </header>

        {/* Recent Projects */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={18} /> Recent Projects
            </h2>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-20 bg-slate-200 rounded-xl"></div>
                <div className="h-20 bg-slate-200 rounded-xl"></div>
              </div>
            ) : (
              <>
                {projects.length === 0 && (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                    <p>No projects yet.</p>
                    <p className="text-sm">Tap + to start creating!</p>
                  </div>
                )}
                {projects.map(proj => (
                  <div key={proj.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition cursor-pointer" onClick={() => router.push('/editor')}>
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl">
                      🎨
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{proj.name || "Untitled Project"}</h3>
                      <p className="text-xs text-slate-500">{new Date(proj.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        {/* Floating Action Button */}
        <button
          onClick={startNewProject}
          className="fixed bottom-6 right-6 md:absolute md:bottom-0 md:right-0 w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center text-white active:scale-95 transition-transform z-10"
        >
          <Plus size={32} />
        </button>
      </div>
    </div>
  );
}
