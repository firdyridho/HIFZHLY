# Aturan Desain Antarmuka (UI/UX Anti-AI-Slop Guidelines)

Dokumen ini adalah aturan wajib (*strict project rule*) yang mengikat seluruh kontributor kode dan model AI (Antigravity, Cursor, Copilot, dsb.) dalam merancang dan memodifikasi antarmuka proyek **Hifzhly**.

---

## 1. Larangan Keras Terhadap Emoji (Zero Emojis Policy)
* **DILARANG KERAS** menggunakan emoji Unicode (seperti 🔥, ⚠️, 🚀, ✨, 💡, 💯, 🎉, 📖, 🏆, dll.) di dalam kode antarmuka komponen, tombol, label, banner, tabel, maupun teks aplikasi.
* Penggunaan emoji membuat aplikasi Al-Qur'an terkesan main-main, tidak profesional, dan terlihat seperti produk otomatis (*AI slop*).
* **Solusi Wajib**: Selalu gunakan ikon SVG berkualitas tinggi berbasis standar **shadcn/ui** melalui pustaka **`lucide-react`** (contoh: `<Flame className="w-4 h-4 text-amber-500" />`, `<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />`, `<Sparkles className="w-4 h-4 text-emerald-600" />`).

---

## 2. Larangan Badging Berlebihan (Anti-Badge Slop)
* **DILARANG** menumpuk badge/pill berwarna-warni bulat lonjong (*rounded-full pill badges*) di setiap sudut judul atau komponen tanpa alasan fungsional yang kuat.
* Jangan menaruh badge berlabel generik seperti `"AI Murojaah"`, `"Hot"`, `"New"`, atau `"Inclusive Education"` yang berulang-ulang di setiap header/halaman.
* Gunakan hierarki tipografi murni (*clean typography*):
  - Judul yang jelas dan berbobot (*font-semibold* / *font-bold*).
  - Teks subjudul berwarna abu-abu redup (*text-slate-500* atau *text-zinc-500*).
  - Jika status benar-benar diperlukan (misal status ayat: *Mutqin*, *Mutasyabih*, atau *Belum Diuji*), gunakan indikator titik (*status dot*) minimalis atau badge monokrom tipis berukuran kecil (`text-[11px] px-2 py-0.5 rounded-md`).

---

## 3. Standar Ikon & Komponen Shadcn / Lucide
* Seluruh ikon grafis wajib berasal dari **`lucide-react`**.
* Ukuran ikon harus konsisten dan proporsional:
  - Tombol standar: `w-4 h-4` (16px)
  - Card & header fitur: `w-5 h-5` (20px)
  - Banner atau empty state: maksimal `w-8 h-8` (32px)
* Ikon harus memiliki kontras yang tenang dan menyatu dengan tata warna (*muted harmonious palette*), hindari warna neon atau mencolok berlebihan.

---

## 4. Estetika Desain: Tenang, Khusyu', dan Ilmiah
Aplikasi ini adalah platform pendidikan Al-Qur'an dan Tajwid. Karakter desain yang wajib ditegakkan:
1. **Tenang (*Tranquil*)**: Latar belakang dominan bersih (`bg-slate-50` / `bg-white`), jarak antar-elemen lega (*airy spacing*), tanpa ornamen gradien berlebihan.
2. **Keterbacaan Al-Qur'an (*Readability First*)**: Tipografi ayat Arab berukuran besar (`text-3xl` s.d. `text-5xl`), jarak antarbaris lapang (*leading-loose*), font *Amiri Quran*.
3. **Standar Kerapian (*Editorial & Precise*)**: Border tipis tegas (`border-slate-200/80`), sudut melengkung modern (`rounded-xl` / `rounded-2xl`), bayangan sangat halus (*shadow-xs* atau *shadow-sm*).
