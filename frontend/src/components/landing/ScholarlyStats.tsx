import { Activity, ShieldCheck, Clock, Award } from 'lucide-react';

export default function ScholarlyStats() {
  const STATS = [
    {
      value: '5.75%',
      label: 'Word Error Rate (WER)',
      desc: 'Tingkat akurasi tinggi model Whisper fine-tuned pada bacaan tartil Al-Qur’an standar.',
      icon: Activity,
    },
    {
      value: '47.3%',
      label: 'Retensi Memori Terbukti',
      desc: 'Meta-analisis 254 studi (Cepeda et al., 2006) membuktikan keunggulan pengulangan berjarak.',
      icon: Award,
    },
    {
      value: '< 3 Detik',
      label: 'Umpan Balik Instan',
      desc: 'Waktu evaluasi Levenshtein per ayat memastikan alur talaqqi mandiri tetap mengalir lancar.',
      icon: Clock,
    },
    {
      value: '100% Resmi',
      label: 'Mushaf Standar Kemenag',
      desc: 'Teks ayat resmi Kemenag RI (EQuran.id API v2) dan pemetaan Mutasyabihat standar Tarteel QUL.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="py-14 bg-white border-y border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="space-y-2 text-left">
                <div className="flex items-center space-x-2 text-slate-500 mb-1">
                  <Icon className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-semibold text-slate-700">{stat.label}</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-mono">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

