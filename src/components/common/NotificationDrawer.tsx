import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, X, Clock } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { 
    currentUser, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useApp();

  if (!isOpen) return null;

  // Filter notifications relevant to current user or broadcast to all
  const filteredNotifs = notifications.filter(
    n => n.recipientId === currentUser?.id || n.recipientId === 'all' || n.roleTarget === currentUser?.role
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Notifications</h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
              {filteredNotifs.filter(n => !n.read).length} new
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              title="Mark all as read"
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 font-medium p-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-3.5 rounded-xl transition-all cursor-pointer mb-1 ${
                  !notif.read ? 'bg-indigo-50/60 border border-indigo-100' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-xs text-slate-900 flex items-center gap-1.5">
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                    <span>{notif.title}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>
                {notif.type === 'urgent_broadcast' && (
                  <div className="mt-2 text-[10px] font-semibold tracking-wider uppercase text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded inline-block">
                    ⚡ Priority Broadcast
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
          Role-filtered notification pipeline with Web Audio chime triggers
        </div>
      </div>
    </div>
  );
};
