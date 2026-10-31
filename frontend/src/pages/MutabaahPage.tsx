export default function MutabaahPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Target Harian</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">10 <span className="text-xs font-normal text-slate-500">Ayat</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Streak Aktif</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">3 <span className="text-xs font-normal text-slate-500">Hari</span></p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Dihafal</span>
          <p className="text-2xl font-extrabold text-teal-600 mt-1">40 <span className="text-xs font-normal text-slate-500">Ayat</span></p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-2">Konsistensi Mingguan</h3>
        <p className="text-xs text-slate-500 mb-4">Catatan mutabaah otomatis terekam setiap kali kamu murojaah.</p>
        <div className="flex items-center justify-between gap-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Aha'].map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center">
              <div className={`w-full h-16 rounded-xl flex items-center justify-center font-bold text-xs ${
                i >= 4 ? 'bg-emerald-500 text-white' : i === 2 ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {i >= 4 ? '10' : i === 2 ? '0' : '10'}
              </div>
              <span className="text-[11px] text-slate-500 mt-1">{day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

