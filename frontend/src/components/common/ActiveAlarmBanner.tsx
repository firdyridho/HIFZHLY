import { useEffect, useState } from 'react';
import { Bell, Square, Volume2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AlarmItem, stopAlarmSound, getCurrentlyRingingAlarm } from '../../lib/alarmService';

export default function ActiveAlarmBanner() {
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  useEffect(() => {
    const handleRinging = (e: any) => {
      if (e.detail?.alarm) {
        setRingingAlarm(e.detail.alarm);
      }
    };

    const handleStopped = () => {
      setRingingAlarm(null);
    };

    window.addEventListener('hifzhly_alarm_ringing', handleRinging);
    window.addEventListener('hifzhly_alarm_stopped', handleStopped);

    const initial = getCurrentlyRingingAlarm();
    if (initial) setRingingAlarm(initial);

    return () => {
      window.removeEventListener('hifzhly_alarm_ringing', handleRinging);
      window.removeEventListener('hifzhly_alarm_stopped', handleStopped);
    };
  }, []);

  if (!ringingAlarm) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-6 duration-300">
      {/* Cool Dark Emerald Glassmorphic Floating Notification Card */}
      <div className="max-w-lg w-full bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white border border-emerald-500/40 rounded-3xl p-5 shadow-2xl ring-1 ring-emerald-500/20 pointer-events-auto backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative emerald ambient glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top Status & Audio Wave */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Pengingat Sedang Berdering</span>
              </span>
            </div>

            {/* Cool Audio Wave Graphic */}
            <div className="flex items-end space-x-1 h-3.5">
              <div className="w-1 bg-emerald-400 rounded-full animate-pulse h-2" />
              <div className="w-1 bg-emerald-300 rounded-full animate-pulse h-3.5" style={{ animationDelay: '150ms' }} />
              <div className="w-1 bg-emerald-400 rounded-full animate-pulse h-2.5" style={{ animationDelay: '300ms' }} />
              <div className="w-1 bg-emerald-300 rounded-full animate-pulse h-3" style={{ animationDelay: '450ms' }} />
            </div>
          </div>

          {/* Main Info */}
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/25 border border-emerald-500/50 flex items-center justify-center shrink-0 shadow-inner">
              <Bell className="w-6 h-6 text-emerald-300 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-baseline space-x-2">
                <span className="font-mono text-xl font-black text-white tracking-tight">
                  {ringingAlarm.time}
                </span>
                <span className="text-xs font-semibold text-emerald-300">WIB</span>
              </div>
              <h4 className="text-sm font-bold text-white truncate">
                {ringingAlarm.label}
              </h4>
              {ringingAlarm.description && (
                <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                  {ringingAlarm.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => stopAlarmSound()}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md shadow-rose-900/40 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan Suara Alarm</span>
            </button>

            <Link
              to="/app/alarm"
              onClick={() => stopAlarmSound()}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-98 border border-white/15 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer text-center"
            >
              <span>Buka Jadwal Alarm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
