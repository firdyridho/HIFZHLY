import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  X,
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
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationItem,
} from '../../lib/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onRefresh: () => void;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  notifications,
  onRefresh,
}: NotificationCenterModalProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

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
        return <Clock className="w-4 h-4 text-amber-700" />;
      case 'target':
        return <Target className="w-4 h-4 text-emerald-700" />;
      case 'srs':
        return <RotateCcw className="w-4 h-4 text-blue-700" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-rose-700" />;
      default:
        return <Bell className="w-4 h-4 text-slate-700" />;
    }
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
      onRefresh();
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead();
    onRefresh();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotificationItem(id);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pemberitahuan & Pengingat</h3>
              <p className="text-[11px] text-slate-500">
                {unreadCount > 0 ? `${unreadCount} pesan belum dibaca` : 'Seluruh pesan telah dibaca'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Bulk Action Toolbar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-white text-emerald-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y-0">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Tidak ada pemberitahuan</p>
              <p className="text-[11px] text-slate-400">
                {filter === 'unread'
                  ? 'Semua pemberitahuan sudah Anda baca.'
                  : 'Belum ada pengingat atau evaluasi baru saat ini.'}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                  item.read
                    ? 'bg-white border-slate-100 hover:border-slate-200'
                    : 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white border border-slate-200/80 shrink-0 shadow-2xs">
                    {getIconForType(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-xs font-bold leading-tight truncate ${
                          item.read ? 'text-slate-800' : 'text-slate-900 font-black'
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">{formatTimeAgo(item.timestamp)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                    {item.actionUrl && (
                      <div className="pt-1.5 flex items-center justify-between">
                        <Link
                          to={item.actionUrl}
                          onClick={() => {
                            handleItemClick(item);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                        >
                          <span>{item.actionLabel || 'Lihat Detail'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer shrink-0"
                    title="Hapus Pesan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
