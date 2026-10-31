import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center space-x-2 text-sm font-bold text-emerald-800 hover:text-emerald-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo saja.png" alt="Hifzhly" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-slate-900">Hifzhly</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Dokumen Resmi Ketentuan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Ketentuan Layanan & Kebijakan Privasi Suara
          </h1>
          <p className="text-slate-500 text-xs">
            Terakhir diperbarui: 31 Oktober 2026 • Tim FIFA Universitas Sultan Ageng Tirtayasa
          </p>
        </div>

        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-sm leading-relaxed text-slate-700">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>1. Posisi Produk & Etika Talaqqi</span>
            </h2>
            <p>
              Hifzhly adalah platform teknologi pendamping (*companion platform*) yang dirancang untuk membantu santri, pelajar, dan penghafal mandiri dalam melatih kelancaran ingatan hafalan (*murojaah*) secara berulang. 
            </p>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium space-y-1">
              <div className="flex items-center space-x-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Perhatian Mengenai Tradisi Talaqqi:</span>
              </div>
              <p>
                Hifzhly <strong>bukan pengganti guru Al-Qur'an, asatidz, atau musyrif halaqah</strong>. Tradisi <em>talaqqi</em> dan <em>musyafahah</em> (belajar langsung bertatap muka dari lisan guru yang bersanad) tetap menjadi rujukan mutlak dan utama dalam memvalidasi keabsahan bacaan dan tajwid Al-Qur'an.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>2. Kebijakan Privasi Rekaman Suara (Audio Privacy)</span>
            </h2>
            <p>
              Kami menjunjung tinggi etika privasi dan kesucian data pengguna. Seluruh rekaman suara bacaan yang dikirimkan ke server Hifzhly tunduk pada aturan ketat berikut:
            </p>
            <ul className="space-y-2 list-none pl-2">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Penghapusan Otomatis:</strong> Berkas rekaman audio suara (WAV/PCM) langsung dihapus secara permanen dari memori dan media penyimpanan sesaat setelah model AI selesai mengevaluasi kata dan menghitung skor.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Data yang Disimpan:</strong> Kami hanya menyimpan metadata sesi murojaah berupa nomor surah, nomor ayat, durasi waktu, skor kelancaran (0–100), dan status kata yang keliru guna keperluan kurva pengulangan Spaced Repetition (SRS).</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Tidak Dijual ke Pihak Ketiga:</strong> Data riwayat mutabaah dan aktivitas akun pengguna tidak akan pernah dijual atau dibagikan ke entitas komersial luar.</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>3. Standar Sumber Teks Al-Qur'an</span>
            </h2>
            <p>
              Teks Al-Qur'an dan terjemahan bahasa Indonesia pada aplikasi ini bersumber langsung dari <strong>Lajnah Pentashihan Mushaf Al-Qur'an (LPMQ) Kementerian Agama Republik Indonesia</strong> melalui integrasi API resmi EQuran.id API v2, serta diperkaya dengan basis data ayat-ayat serupa (<em>mutasyabihat</em>) dari <strong>Tarteel QUL (Quranic Universal Library)</strong>.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>4. Hak Cipta & Narahubung</span>
            </h2>
            <p>
              Platform Hifzhly dikembangkan oleh <strong>Tim FIFA (Universitas Sultan Ageng Tirtayasa)</strong> yang dipimpin oleh <strong>Firdy Ridho Fillah</strong> dan <strong>Faeyza Ardellein Yaradhitya</strong> dalam rangka kompetisi Hackathon Subtema <em>Inclusive Education and Future Skills</em>.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© 2026 Tim FIFA - Universitas Sultan Ageng Tirtayasa. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
