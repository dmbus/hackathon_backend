import {
    Calendar,
    Check,
    Crown,
    Edit3,
    Loader2,
    Mail,
    Save,
    Sparkles,
    User as UserIcon,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';

const Card = ({ children, className = "", ...props }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`} {...props}>
        {children}
    </div>
);

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getUserProfile();
            setProfile(data);
            setEditedName(data.name || '');
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async () => {
        try {
            setSaving(true);
            const updated = await updateUserProfile({ name: editedName });
            setProfile(updated);
            setIsEditingName(false);
        } catch (err) {
            setError('Failed to update name');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSubscriptionStatus = () => {
        if (!profile?.subscription) return { status: 'unknown', color: 'slate' };
        const { status, plan } = profile.subscription;
        if (status === 'active') {
            return { status: plan === 'trial' ? 'Trial Active' : 'Active', color: 'emerald' };
        }
        return { status: 'Expired', color: 'red' };
    };

    const getDaysRemaining = () => {
        if (!profile?.subscription?.expires_at) return 0;
        const expiresAt = new Date(profile.subscription.expires_at);
        const now = new Date();
        const diff = expiresAt - now;
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                    onClick={fetchProfile}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const subscriptionStatus = getSubscriptionStatus();
    const daysRemaining = getDaysRemaining();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Card */}
            <Card className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        {user?.photoURL ? (
                            <img
                                src={user.photoURL}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserIcon size={40} className="text-indigo-600" />
                            </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-${subscriptionStatus.color}-100 flex items-center justify-center`}>
                            <Crown size={16} className={`text-${subscriptionStatus.color}-600`} />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        {/* Name */}
                        <div className="flex items-center gap-3 mb-2">
                            {isEditingName ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                        className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-600 focus:outline-none bg-transparent"
                                        placeholder="Enter your name"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={saving}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingName(false);
                                            setEditedName(profile?.name || '');
                                        }}
                                        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        {profile?.name || user?.displayName || 'Set your name'}
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 text-slate-500 mb-4">
                            <Mail size={16} />
                            <span>{profile?.email || user?.email}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                                <Calendar size={14} className="text-slate-500" />
                                <span className="text-sm text-slate-600">Joined {formatDate(profile?.created_at)}</span>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 bg-${subscriptionStatus.color}-50 rounded-lg`}>
                                <Sparkles size={14} className={`text-${subscriptionStatus.color}-600`} />
                                <span className={`text-sm font-medium text-${subscriptionStatus.color}-700`}>
                                    {subscriptionStatus.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Subscription Card */}
            <Card className="overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Crown size={24} />
                        <h3 className="text-xl font-bold">
                            {profile?.subscription?.plan === 'trial' ? 'Free Trial' : 'Subscription'}
                        </h3>
                    </div>
                    <p className="text-indigo-100">
                        {profile?.subscription?.plan === 'trial' 
                            ? 'Enjoy full access to all features during your trial period'
                            : 'Your current subscription plan'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Trial Status */}
                    {profile?.subscription?.plan === 'trial' && (
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div>
                                <p className="font-semibold text-amber-800">Trial Period</p>
                                <p className="text-sm text-amber-600">
                                    {daysRemaining > 0 
                                        ? `${daysRemaining} days remaining`
                                        : 'Your trial has expired'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-amber-600">Expires</p>
                                <p className="font-semibold text-amber-800">{formatDate(profile?.subscription?.expires_at)}</p>
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    <div>
                        <h4 className="font-semibold text-slate-800 mb-3">Included Features</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {(profile?.subscription?.features || ['flashcards', 'speaking', 'listening', 'tests']).map((feature) => (
                                <div key={feature} className="flex items-center gap-2 text-slate-600">
                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Check size={12} className="text-emerald-600" />
                                    </div>
                                    <span className="capitalize">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upgrade Button */}
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <Sparkles size={18} />
                        {profile?.subscription?.plan === 'trial' ? 'Upgrade to Premium' : 'Manage Subscription'}
                    </button>
                </div>
            </Card>

            {/* Account Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Account</h3>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors text-left">
                        <div>
                            <p className="font-medium text-slate-800">Change Password</p>
                            <p className="text-sm text-slate-500">Update your password for security</p>
                        </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-red-50 transition-colors text-left group">
                        <div>
                            <p className="font-medium text-red-600">Delete Account</p>
                            <p className="text-sm text-slate-500 group-hover:text-red-400">Permanently delete your account and data</p>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;
