import { useEffect, useState } from 'react';
import { Bell, Square, Volume2 } from 'lucide-react';
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
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top-6 duration-300">
      <div className="max-w-md w-full bg-slate-900/95 backdrop-blur-md text-white border border-emerald-500/40 rounded-2xl p-4 shadow-2xl pointer-events-auto flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
          <Bell className="w-5 h-5 text-emerald-400 animate-bounce" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>Alarm Berdering ({ringingAlarm.time})</span>
            </span>
          </div>

          <h4 className="text-sm font-black text-white truncate">
            {ringingAlarm.label}
          </h4>

          {ringingAlarm.description && (
            <p className="text-xs text-slate-300 leading-snug line-clamp-2">
              {ringingAlarm.description}
            </p>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => stopAlarmSound()}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Hentikan Suara Alarm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
