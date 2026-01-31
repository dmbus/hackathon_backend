import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    Info,
    Loader2,
    Sparkles,
    Trophy,
    AlertTriangle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead } from '../services/userService';

const Card = ({ children, className = "", ...props }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`} {...props}>
        {children}
    </div>
);

const getNotificationIcon = (type) => {
    switch (type) {
        case 'success':
            return { icon: Sparkles, bg: 'bg-emerald-100', color: 'text-emerald-600' };
        case 'achievement':
            return { icon: Trophy, bg: 'bg-amber-100', color: 'text-amber-600' };
        case 'warning':
            return { icon: AlertTriangle, bg: 'bg-orange-100', color: 'text-orange-600' };
        default:
            return { icon: Info, bg: 'bg-blue-100', color: 'text-blue-600' };
    }
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getUserNotifications();
            setNotifications(data);
        } catch (err) {
            setError('Failed to load notifications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (notificationId) => {
        try {
            await markNotificationRead(notificationId, true);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Actions */}
            {unreadCount > 0 && (
                <div className="flex justify-end">
                    <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-colors"
                    >
                        <CheckCheck size={18} />
                        Mark all as read
                    </button>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <BellOff size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No notifications yet</h3>
                    <p className="text-slate-500">We'll notify you when something important happens</p>
                </Card>
            ) : (
                <Card className="overflow-hidden divide-y divide-slate-100">
                    {notifications.map((notification) => {
                        const iconConfig = getNotificationIcon(notification.type);
                        const IconComponent = iconConfig.icon;
                        
                        return (
                            <div
                                key={notification.id}
                                className={`p-4 flex items-start gap-4 transition-colors ${
                                    notification.read ? 'bg-white' : 'bg-indigo-50/50'
                                }`}
                            >
                                <div className={`p-2.5 rounded-xl ${iconConfig.bg} shrink-0`}>
                                    <IconComponent size={20} className={iconConfig.color} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className={`font-semibold ${notification.read ? 'text-slate-700' : 'text-slate-900'}`}>
                                            {notification.title}
                                        </h4>
                                        <span className="text-xs text-slate-400 whitespace-nowrap">
                                            {formatTimeAgo(notification.created_at)}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 ${notification.read ? 'text-slate-500' : 'text-slate-600'}`}>
                                        {notification.message}
                                    </p>
                                </div>

                                {!notification.read && (
                                    <button
                                        onClick={() => handleMarkRead(notification.id)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors shrink-0"
                                        title="Mark as read"
                                    >
                                        <Check size={16} />
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </Card>
            )}

            {/* Notification Preferences Link */}
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-xl">
                        <Bell size={24} className="text-slate-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">Notification Preferences</h3>
                        <p className="text-sm text-slate-500">Customize what notifications you receive</p>
                    </div>
                    <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition-colors">
                        Configure
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default NotificationsPage;
