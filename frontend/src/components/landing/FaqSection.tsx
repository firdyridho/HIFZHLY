import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: 'Bagaimana kecerdasan buatan mengevaluasi suara saya tanpa ustaz tatap muka?',
    a: 'Hifzhly menggabungkan model speech recognition Whisper yang telah dioptimasi untuk fonetik Al-Qur’an dengan algoritma penyejajaran jarak edit Levenshtein. Sistem menormalisasi teks Arab dan membandingkan setiap kata dengan naskah resmi Mushaf Madinah secara objektif untuk mendeteksi kata yang tertukar, terlewat, atau berlebih.',
  },
  {
    q: 'Apakah rekaman suara saya disimpan secara permanen di server?',
    a: 'Tidak. Privasi suara pengguna adalah prioritas mutlak. Berkas audio rekaman hanya diproses di dalam memory server selama proses evaluasi Levenshtein berlangsung (< 3 detik) dan langsung dimusnahkan. Tidak ada arsip rekaman mentah yang disimpan permanen di database.',
  },
  {
    q: 'Apa perbedaan utama Hifzhly dengan aplikasi Al-Qur’an konvensional?',
    a: 'Aplikasi biasa hanya berfungsi sebagai pemutar audio atau mushaf PDF statis. Hifzhly adalah asisten adaptif: sistem mendengarkan bacaanmu, menyorot kata yang keliru, menjadwalkan ulang ayat yang lemah secara otomatis menggunakan rumus Spaced Repetition (SuperMemo-2), dan memunculkan peringatan dini pada ayat Mutasyabihat agar hafalan tidak tertukar.',
  },
  {
    q: 'Apa itu ayat Mutasyabihat dan bagaimana Hifzhly membantu?',
    a: 'Ayat Mutasyabihat adalah ayat-ayat yang memiliki lafal pembuka, penutup, atau wazan serupa di surah lain yang kerap membuat santri salah melompat bacaan. Mengadopsi standar Tarteel QUL (Quranic Universal Library), Hifzhly memberikan indikator peringatan visual dan catatan pembeda sebelum kesalahan terjadi.',
  },
  {
    q: 'Apakah platform Hifzhly dapat diakses melalui smartphone?',
    a: 'Ya, seluruh antarmuka Hifzhly dibangun secara responsif (mobile-first) dan telah diuji dari resolusi layar smartphone 360 px hingga monitor desktop lebar, serta mendukung perekaman langsung lewat peramban ponsel tanpa perlu menginstal aplikasi tambahan.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 max-w-4xl mx-auto px-4 w-full">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
          Pertanyaan Umum
        </p>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Tanya Jawab Seputar Hifzhly
        </h2>
        <p className="text-slate-600 text-sm mt-2">
          Transparansi metode evaluasi AI, privasi suara, dan algoritma memori kognitif.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full px-6 py-4.5 text-left flex items-center justify-between font-bold text-slate-900 text-sm sm:text-base hover:text-emerald-800 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0 ml-4" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-4" />
                )}
              </button>

              {isOpen && (
                <div className="px-6 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

