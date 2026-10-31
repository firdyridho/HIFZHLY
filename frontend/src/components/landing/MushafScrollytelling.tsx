import { ScrollTimeline, type TimelineEvent } from "@/components/lightswind/scroll-timeline";
import { Mic, AlertTriangle, Calendar, Award, CheckCircle2 } from "lucide-react";

export default function MushafScrollytelling() {
  const TIMELINE_EVENTS: TimelineEvent[] = [
    {
      id: "stage-1",
      year: "Tahap 01",
      title: "Penyejajaran Levenshtein Kata demi Kata",
      subtitle: "Kecerdasan Buatan & Evaluator Suara",
      description:
        "Setiap suku kata Arab yang dilafalkan dinormalisasi dan dibandingkan terhadap teks rujukan Mushaf Madinah (EQuran.id API v2). Kesalahan tidak lagi terlewat seperti saat murojaah sendiri di rumah.",
      icon: <Mic className="w-4 h-4 text-emerald-600" />,
      customContent: (
        <div className="space-y-3 font-sans">
          <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200/80 font-quran text-2xl leading-loose" dir="rtl">
            <span className="text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded">عَمَّ</span>{" "}
            <span className="text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded">يَتَسَآءَلُونَ</span>{" "}
            <span className="text-amber-600 font-sans text-lg">۝١</span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Hasil Penyejajaran: S=0 (Substitusi), D=0 (Delesi), I=0 (Insersi). Skor: 100/100.</span>
          </div>
        </div>
      ),
    },
    {
      id: "stage-2",
      year: "Tahap 02",
      title: "Peringatan Dini Ayat Mutasyabihat",
      subtitle: "Standar Tarteel QUL (Quranic Universal Library)",
      description:
        "Hafizhul Qur’an sering kali terselip pada ayat yang memiliki lafal pembuka atau penutup serupa. Hifzhly mengadopsi standar pemetaan Mutasyabihat untuk memunculkan peringatan langsung sebelum santri melompat ayat.",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      customContent: (
        <div className="space-y-2 font-sans">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
            <span className="font-bold text-amber-900 block mb-1">QS. An-Naba' [78: 1] vs QS. Al-Mursalat [77: 1]</span>
            <p className="font-quran text-lg text-right text-slate-800" dir="rtl">
              عَمَّ يَتَسَآءَلُونَ ۝١ <span className="text-slate-400 font-sans text-xs">|</span> وَالْمُرْسَلَٰتِ عُرْفًا ۝١
            </p>
          </div>
          <p className="text-[11px] text-slate-600 italic">
            Catatan: Wazan ayat serupa di Juz 30 ditandai otomatis agar lisan tidak melompat surah.
          </p>
        </div>
      ),
    },
    {
      id: "stage-3",
      year: "Tahap 03",
      title: "Jadwal Murojaah Adaptif (Spaced Repetition)",
      subtitle: "Sains Kognitif & Algoritma SuperMemo-2",
      description:
        "Berdasarkan riset Distributed Practice (Cepeda et al., 2006), sistem menghitung kurva kelupaan secara adaptif per ayat. Santri tidak perlu lagi menebak surah mana yang harus diulang hari ini.",
      icon: <Calendar className="w-4 h-4 text-teal-600" />,
      customContent: (
        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-slate-700 space-y-2">
          <div className="flex justify-between items-center font-mono">
            <span className="font-bold text-teal-900">Ease Factor (EF): 2.50 → 2.60</span>
            <span className="font-bold text-emerald-700">Interval: +7 Hari</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: "65%" }} />
          </div>
        </div>
      ),
    },
    {
      id: "stage-4",
      year: "Tahap 04",
      title: "Mutabaah Digital & Peningkatan Status Mutqin",
      subtitle: "Pencatatan Otomatis & Pemantauan Konsistensi",
      description:
        "Setiap sesi evaluasi langsung memperbarui mutabaah santri secara transparan. Menghitung streak harian dan memetakan ayat-ayat yang sudah mantap (mutqin) vs ayat yang butuh review segera.",
      icon: <Award className="w-4 h-4 text-sky-600" />,
      customContent: (
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans">
          <span className="text-slate-600">Status Retensi Ayat:</span>
          <span className="font-bold text-emerald-700">
            Terkonfirmasi Mutqin
          </span>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 w-full relative">
      <ScrollTimeline
        title="Terus Gulir, Selami Arsitektur Evaluasi Hifzhly"
        subtitle="Bagaimana Speech Recognition, Pemetaan Mutasyabihat, dan Algoritma SRS bekerja bersama dalam satu garis waktu interaktif."
        events={TIMELINE_EVENTS}
        cardAlignment="alternating"
        dateFormat="text"
        revealAnimation="slide"
        lineColor="bg-slate-200"
        activeColor="bg-emerald-600"
        progressIndicator={true}
      />
    </section>
  );
}
