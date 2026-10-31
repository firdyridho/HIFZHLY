import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Clock, Award } from 'lucide-react';
import { InteractiveCard } from '@/components/lightswind/interactive-card';

export default function ScholarlyStats() {
  const STATS = [
    {
      value: '5.75%',
      label: 'Word Error Rate (WER)',
      desc: 'Tingkat akurasi tinggi model Whisper fine-tuned pada bacaan tartil standar.',
      icon: Activity,
      color: 'rgba(16, 185, 129, 0.22)',
    },
    {
      value: '47.3%',
      label: 'Retensi Memori Terbukti',
      desc: 'Meta-analisis 254 studi membuktikan keunggulan pengulangan berjarak (Cepeda et al.).',
      icon: Award,
      color: 'rgba(20, 184, 166, 0.22)',
    },
    {
      value: '< 3 Detik',
      label: 'Umpan Balik Instan',
      desc: 'Waktu evaluasi Levenshtein per ayat memastikan alur talaqqi mandiri tetap mengalir.',
      icon: Clock,
      color: 'rgba(14, 165, 233, 0.22)',
    },
    {
      value: '100% Resmi',
      label: 'Mushaf Standar Kemenag',
      desc: 'Naskah resmi EQuran.id API v2 dan pemetaan Mutasyabihat Tarteel QUL.',
      icon: ShieldCheck,
      color: 'rgba(245, 158, 11, 0.22)',
    },
  ];

  return (
    <section className="py-16 bg-white border-y border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex"
              >
                <InteractiveCard
                  InteractiveColor={stat.color}
                  borderRadius="20px"
                  rotationFactor={0.2}
                  className="p-6 flex flex-col justify-between h-full space-y-3"
                  containerClassName="h-full"
                >
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Icon className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-semibold text-slate-700">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stat.desc}
                  </p>
                </InteractiveCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
