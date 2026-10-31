import { useState, useEffect } from 'react';
import { ChevronRight, Loader2 } from 'lucide-react';
import type { TajwidModule } from '../types';

export default function TajwidPage() {
  const [tajwidModules, setTajwidModules] = useState<TajwidModule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/tajwid/modules')
      .then((res) => res.json())
      .then((data) => setTajwidModules(data || []))
      .catch((err) => console.error('Error fetching tajwid modules:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-emerald-700 space-x-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Memuat modul Tajwid Academy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Modul Edukasi Tajwid & Kuis</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tajwidModules.map((module) => (
          <div
            key={module.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                Modul {module.orderIndex}
              </span>
              <h3 className="font-bold text-slate-900 text-base mt-2">{module.title}</h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{module.summary}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Teks, Video & Kuis</span>
              <button className="flex items-center space-x-1 text-xs text-emerald-700 font-bold hover:underline">
                <span>Pelajari</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

