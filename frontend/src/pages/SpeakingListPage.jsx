import {
    Award,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Filter,
    Loader2,
    Mic,
    Play,
    RefreshCw,
    Search,
    TrendingUp,
    XCircle
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingService } from '../services/speakingService';

// --- Helper Components ---

const Badge = ({ children, color = 'slate' }) => {
    const styles = {
        slate: "bg-slate-100 text-slate-600",
        indigo: "bg-indigo-50 text-indigo-700",
        emerald: "bg-emerald-50 text-emerald-700",
        amber: "bg-amber-50 text-amber-700",
        rose: "bg-rose-50 text-rose-700",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[color] || styles.slate}`}>
            {children}
        </span>
    );
};

const ScoreRing = ({ score }) => {
    const getColor = (s) => {
        if (s >= 90) return "text-emerald-500 border-emerald-500 bg-emerald-50";
        if (s >= 75) return "text-indigo-500 border-indigo-500 bg-indigo-50";
        if (s >= 60) return "text-amber-500 border-amber-500 bg-amber-50";
        return "text-rose-500 border-rose-500 bg-rose-50";
    };

    return (
        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${getColor(score)}`}>
            {score}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, subtitle }) => (
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
        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Icon size={24} />
        </div>
    </div>
);

const getCefrBadgeColor = (level) => {
    if (level?.startsWith('A')) return 'emerald';
    if (level?.startsWith('B')) return 'indigo';
    if (level?.startsWith('C')) return 'amber';
    return 'slate';
};

// --- Main App Component ---

export default function SpeakingListPage() {
    const navigate = useNavigate();
    
    // State
    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState('All');
    
    // Pagination
    const [page, setPage] = useState(0);
    const pageSize = 10;

    // Fetch history on mount and when page changes
    useEffect(() => {
        fetchHistory();
    }, [page]);

    const fetchHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await speakingService.getHistory(page * pageSize, pageSize);
            setSessions(data.sessions || []);
            setTotal(data.total || 0);
        } catch (err) {
            console.error('Failed to fetch speaking history:', err);
            setError(err.message || 'Failed to load history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic (client-side filtering on loaded data)
    const filteredData = useMemo(() => {
        return sessions.filter(item => {
            const matchesSearch = item.questionText?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterLevel === 'All' || item.cefrLevel?.includes(filterLevel);
            return matchesSearch && matchesFilter;
        });
    }, [sessions, searchTerm, filterLevel]);

    // Derived Statistics
    const avgScore = sessions.length > 0
        ? Math.round(sessions.reduce((acc, curr) => acc + (curr.score || 0), 0) / sessions.length)
        : 0;
    
    const totalWordsCorrect = sessions.reduce((acc, curr) => acc + (curr.wordsUsedCorrectly || 0), 0);
    const totalWordsTarget = sessions.reduce((acc, curr) => acc + (curr.targetWordsCount || 0), 0);

    // Pagination helpers
    const totalPages = Math.ceil(total / pageSize);
    const canGoBack = page > 0;
    const canGoForward = page < totalPages - 1;

    const renderLoading = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading your practice history...</p>
        </div>
    );

    const renderError = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="bg-rose-100 p-4 rounded-full mb-4">
                <XCircle size={48} className="text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load history</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">{error}</p>
            <button
                onClick={fetchHistory}
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
                <Mic size={48} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No practice sessions yet</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">
                Start your first speaking practice to see your history and progress here.
            </p>
            <button
                onClick={() => navigate('/learning/speaking/practice')}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
                <Mic size={18} />
                Start Practice
            </button>
        </div>
    );

    return (
        <div className="font-sans text-slate-600">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Speaking History</h1>
                        <p className="text-slate-500 font-medium">Track your speaking progress and feedback.</p>
                    </div>
                    <button
                        onClick={() => navigate('/learning/speaking/practice')}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        <Mic size={18} />
                        New Practice
                    </button>
                </div>

                {/* Stats Grid - Only show if we have data */}
                {!loading && !error && sessions.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <StatCard
                            icon={TrendingUp}
                            label="Average Score"
                            value={`${avgScore}%`}
                            subtitle={avgScore >= 80 ? "Great progress!" : "Keep practicing!"}
                        />
                        <StatCard
                            icon={Award}
                            label="Words Used Correctly"
                            value={`${totalWordsCorrect}/${totalWordsTarget}`}
                            subtitle={totalWordsTarget > 0 ? `${Math.round((totalWordsCorrect / totalWordsTarget) * 100)}% accuracy` : "No data"}
                        />
                        <StatCard
                            icon={Clock}
                            label="Completed Sessions"
                            value={total}
                            subtitle="Total practice sessions"
                        />
                    </div>
                )}

                {/* Loading State */}
                {loading && renderLoading()}

                {/* Error State */}
                {!loading && error && renderError()}

                {/* Empty State */}
                {!loading && !error && sessions.length === 0 && renderEmpty()}

                {/* Data Table */}
                {!loading && !error && sessions.length > 0 && (
                    <>
                        {/* Filters & Actions Bar */}
                        <div className="bg-white p-4 rounded-t-2xl border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search questions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    />
                                </div>
                                <div className="hidden md:block h-8 w-px bg-slate-200 mx-2"></div>
                                <div className="flex items-center gap-2">
                                    <Filter size={16} className="text-slate-400" />
                                    <select
                                        className="bg-transparent text-sm font-semibold text-slate-600 focus:outline-none cursor-pointer"
                                        value={filterLevel}
                                        onChange={(e) => setFilterLevel(e.target.value)}
                                    >
                                        <option value="All">All Levels</option>
                                        <option value="A1">A1 Beginner</option>
                                        <option value="A2">A2 Elementary</option>
                                        <option value="B1">B1 Intermediate</option>
                                        <option value="B2">B2 Upper Int.</option>
                                        <option value="C1">C1 Advanced</option>
                                        <option value="C2">C2 Proficient</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                onClick={fetchHistory}
                                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>

                        {/* Results Table */}
                        <div className="bg-white rounded-b-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 border-b border-slate-100">
                                            <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Question</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Score</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Words</th>
                                            <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredData.length > 0 ? (
                                            filteredData.map((item) => (
                                                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                                                    {/* Question Column */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-600 text-sm line-clamp-2 mb-2">
                                                                "{item.questionText}"
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <Badge color={getCefrBadgeColor(item.cefrLevel)}>
                                                                    {item.cefrLevel || 'N/A'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Date Column */}
                                                    <td className="py-4 px-6 align-top">
                                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                                            <Calendar size={14} className="text-slate-400" />
                                                            {new Date(item.createdAt).toLocaleDateString('en-US', { 
                                                                month: 'short', 
                                                                day: 'numeric', 
                                                                year: 'numeric' 
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-slate-400 mt-1 pl-6">
                                                            {new Date(item.createdAt).toLocaleTimeString('en-US', { 
                                                                hour: '2-digit', 
                                                                minute: '2-digit' 
                                                            })}
                                                        </div>
                                                    </td>

                                                    {/* Score Column */}
                                                    <td className="py-4 px-6 align-middle">
                                                        <div className="flex justify-center">
                                                            <ScoreRing score={item.score} />
                                                        </div>
                                                    </td>

                                                    {/* Words Column */}
                                                    <td className="py-4 px-6 align-middle text-center">
                                                        <span className="text-sm font-medium text-slate-600">
                                                            {item.wordsUsedCorrectly}/{item.targetWordsCount}
                                                        </span>
                                                        <div className="text-xs text-slate-400">correct</div>
                                                    </td>

                                                    {/* Action Column */}
                                                    <td className="py-4 px-6 align-middle text-right">
                                                        <div className="flex items-center justify-end">
                                                            <button
                                                                onClick={() => navigate('/learning/speaking/practice')}
                                                                className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md active:scale-95"
                                                                title="Start new practice"
                                                            >
                                                                <Play size={16} className="ml-0.5" fill="currentColor" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Search size={32} className="opacity-20" />
                                                        <p>No sessions found matching your filters.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                                <span className="text-xs font-semibold text-slate-500">
                                    Showing <span className="text-slate-800">{page * pageSize + 1}-{Math.min((page + 1) * pageSize, total)}</span> of <span className="text-slate-800">{total}</span> results
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        disabled={!canGoBack}
                                        onClick={() => setPage(p => p - 1)}
                                        className={`p-2 rounded-lg border border-slate-200 transition-all ${
                                            canGoBack 
                                                ? 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 cursor-pointer' 
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button 
                                        disabled={!canGoForward}
                                        onClick={() => setPage(p => p + 1)}
                                        className={`p-2 rounded-lg border border-slate-200 transition-all ${
                                            canGoForward 
                                                ? 'text-slate-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 cursor-pointer' 
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
