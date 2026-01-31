import {
    Award,
    ChevronRight,
    Filter,
    Loader2,
    RefreshCw,
    Target,
    TrendingUp,
    Volume2,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pronunciationService } from '../services/pronunciationService';

// --- Helper Components ---

const DifficultyBadge = ({ level }) => {
    const styles = {
        beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
        intermediate: "bg-amber-50 text-amber-700 border-amber-200",
        advanced: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[level] || styles.intermediate}`}>
            {level}
        </span>
    );
};

const MasteryBadge = ({ level }) => {
    const styles = {
        new: "bg-slate-100 text-slate-500",
        practicing: "bg-amber-100 text-amber-700",
        mastered: "bg-emerald-100 text-emerald-700",
    };
    const labels = {
        new: "New",
        practicing: "Practicing",
        mastered: "Mastered",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[level] || styles.new}`}>
            {labels[level] || "New"}
        </span>
    );
};

const ProgressBar = ({ value, max = 100 }) => {
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="w-full bg-slate-100 rounded-full h-2">
            <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, subtitle, color = "slate" }) => {
    const iconColors = {
        slate: "bg-slate-50 text-slate-400",
        indigo: "bg-indigo-50 text-indigo-500",
        emerald: "bg-emerald-50 text-emerald-500",
        amber: "bg-amber-50 text-amber-500",
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <div className="text-2xl font-bold text-slate-800">{value}</div>
                {subtitle && (
                    <div className="text-xs font-medium mt-1 text-slate-500">
                        {subtitle}
                    </div>
                )}
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${iconColors[color]}`}>
                <Icon size={24} />
            </div>
        </div>
    );
};

const ModuleCard = ({ module, onClick }) => {
    const progress = module.user_progress;
    const avgScore = progress?.average_score || 0;
    const totalAttempts = progress?.total_attempts || 0;
    const masteryLevel = progress?.mastery_level || 'new';

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-mono font-bold text-lg">
                        {module.phoneme_ipa}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {module.name}
                        </h3>
                        <p className="text-sm text-slate-500">{module.exercises_count} exercises</p>
                    </div>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
            </div>

            <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                {module.description}
            </p>

            <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                    <DifficultyBadge level={module.difficulty_level} />
                    <MasteryBadge level={masteryLevel} />
                </div>
                {totalAttempts > 0 && (
                    <span className="text-sm font-semibold text-slate-600">
                        {Math.round(avgScore)}%
                    </span>
                )}
            </div>

            {totalAttempts > 0 && (
                <ProgressBar value={avgScore} />
            )}

            {totalAttempts === 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Target size={14} />
                    <span>Not started yet</span>
                </div>
            )}
        </div>
    );
};

// --- Main Component ---

export default function PronunciationListPage() {
    const navigate = useNavigate();

    // State
    const [modules, setModules] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterDifficulty, setFilterDifficulty] = useState('all');

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [modulesData, statsData] = await Promise.all([
                pronunciationService.getModules(),
                pronunciationService.getStats().catch(() => null)
            ]);
            setModules(modulesData || []);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to fetch pronunciation data:', err);
            setError(err.message || 'Failed to load pronunciation modules.');
        } finally {
            setLoading(false);
        }
    };

    // Filter modules
    const filteredModules = modules.filter(m => {
        if (filterDifficulty === 'all') return true;
        return m.difficulty_level === filterDifficulty;
    });

    // Group by difficulty
    const groupedModules = {
        beginner: filteredModules.filter(m => m.difficulty_level === 'beginner'),
        intermediate: filteredModules.filter(m => m.difficulty_level === 'intermediate'),
        advanced: filteredModules.filter(m => m.difficulty_level === 'advanced'),
    };

    const renderLoading = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading pronunciation modules...</p>
        </div>
    );

    const renderError = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="bg-rose-100 p-4 rounded-full mb-4">
                <XCircle size={48} className="text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load modules</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">{error}</p>
            <button
                onClick={fetchData}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all"
            >
                <RefreshCw size={18} />
                Try Again
            </button>
        </div>
    );

    const renderEmpty = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="bg-slate-100 p-4 rounded-full mb-4">
                <Volume2 size={48} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No modules available</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
                Pronunciation modules are being prepared. Check back soon!
            </p>
        </div>
    );

    const renderModuleGroup = (title, modules, color) => {
        if (modules.length === 0) return null;

        const colorStyles = {
            emerald: "border-emerald-200 bg-emerald-50/30",
            amber: "border-amber-200 bg-amber-50/30",
            rose: "border-rose-200 bg-rose-50/30",
        };

        return (
            <div className="mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${colorStyles[color]}`}>
                    <span className="font-bold text-slate-700">{title}</span>
                    <span className="text-sm text-slate-500">({modules.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map(module => (
                        <ModuleCard
                            key={module.id}
                            module={module}
                            onClick={() => navigate(`/learning/pronunciation/${module.sound_id}`)}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="font-sans text-slate-600">
            <div className="max-w-6xl mx-auto">
                {/* Stats Grid - Only show if we have data */}
                {!loading && !error && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            icon={TrendingUp}
                            label="Average Score"
                            value={`${Math.round(stats.average_score || 0)}%`}
                            subtitle={stats.total_sessions > 0 ? `${stats.total_sessions} sessions` : "Start practicing!"}
                            color="indigo"
                        />
                        <StatCard
                            icon={Award}
                            label="Modules Mastered"
                            value={stats.modules_mastered || 0}
                            subtitle={`of ${stats.total_modules_practiced || 0} practiced`}
                            color="emerald"
                        />
                        <StatCard
                            icon={Target}
                            label="Needs Practice"
                            value={stats.weak_sounds?.length || 0}
                            subtitle={stats.weak_sounds?.length > 0 ? "sounds to improve" : "Great job!"}
                            color="amber"
                        />
                    </div>
                )}

                {/* Filter Bar */}
                {!loading && !error && modules.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-slate-400" />
                                <select
                                    className="bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
                                    value={filterDifficulty}
                                    onChange={(e) => setFilterDifficulty(e.target.value)}
                                >
                                    <option value="all">All Levels</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && renderLoading()}

                {/* Error State */}
                {!loading && error && renderError()}

                {/* Empty State */}
                {!loading && !error && modules.length === 0 && renderEmpty()}

                {/* Module Grid */}
                {!loading && !error && modules.length > 0 && (
                    <>
                        {filterDifficulty === 'all' ? (
                            <>
                                {renderModuleGroup("Beginner", groupedModules.beginner, "emerald")}
                                {renderModuleGroup("Intermediate", groupedModules.intermediate, "amber")}
                                {renderModuleGroup("Advanced", groupedModules.advanced, "rose")}
                            </>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredModules.map(module => (
                                    <ModuleCard
                                        key={module.id}
                                        module={module}
                                        onClick={() => navigate(`/learning/pronunciation/${module.sound_id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
