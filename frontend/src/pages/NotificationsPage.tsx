import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  Trash2,
  Clock,
  Target,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import {
  NotificationItem,
  getStoredNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationItem,
} from '../lib/notificationService';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const refreshList = () => {
    setNotifications(getStoredNotifications());
  };

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('hifzhly_notifications_updated', handleUpdate);
    return () => {
      window.removeEventListener('hifzhly_notifications_updated', handleUpdate);
    };
  }, []);

  const filteredItems = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'prayer':
        return <Clock className="w-5 h-5 text-amber-700" />;
      case 'target':
        return <Target className="w-5 h-5 text-emerald-700" />;
      case 'srs':
        return <RotateCcw className="w-5 h-5 text-blue-700" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-rose-700" />;
      default:
        return <Bell className="w-5 h-5 text-slate-700" />;
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
      refreshList();
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    refreshList();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotificationItem(id);
    refreshList();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 font-sans">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-xs font-bold">Kembali ke Beranda</span>
          </button>

          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
            Pusat Pemberitahuan
          </h2>

          <div className="w-9" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        {/* Cool Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Bell className="w-3.5 h-3.5" />
                <span>Pusat Informasi &amp; Evaluasi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pemberitahuan &amp; Pengingat
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
                Pantau pengingat waktu sholat, status target harian santri, evaluasi repetisi berjarak, dan notifikasi keamanan akun.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="text-[11px] text-slate-400 font-medium">Belum Dibaca</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {unreadCount}
                <span className="text-sm text-slate-400 font-sans font-normal"> / {notifications.length} Pesan</span>
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar Filter & Bulk Action */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'unread'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Notification Cards List */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Tidak Ada Pemberitahuan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {filter === 'unread'
                ? 'Seluruh pemberitahuan sudah Anda baca.'
                : 'Belum ada pengingat atau evaluasi baru saat ini.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer relative group ${
                  item.read
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-emerald-50/50 border-emerald-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                    {getIconForType(item.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-sm leading-tight truncate ${
                          item.read ? 'font-bold text-slate-800' : 'font-black text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.message}
                    </p>

                    {item.actionUrl && (
                      <div className="pt-2 flex items-center justify-between">
                        <Link
                          to={item.actionUrl}
                          onClick={() => handleItemClick(item)}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                        >
                          <span>{item.actionLabel || 'Lihat Selengkapnya'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                    title="Hapus Pemberitahuan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
