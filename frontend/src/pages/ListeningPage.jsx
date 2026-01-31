import {
    Book,
    CheckCircle2,
    Clock,
    Filter,
    Heart,
    Loader2,
    MoreVertical,
    Pause,
    Play,
    Plus,
    Search
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPodcasts } from '../services/podcastService';

// --- Helper: CEFR Level Badge ---
const LevelBadge = ({ level }) => {
    const styles = {
        A1: "bg-emerald-50 text-emerald-700 border-emerald-200",
        A2: "bg-teal-50 text-teal-700 border-teal-200",
        B1: "bg-blue-50 text-blue-700 border-blue-200",
        B2: "bg-indigo-50 text-indigo-700 border-indigo-200",
        C1: "bg-violet-50 text-violet-700 border-violet-200",
        C2: "bg-rose-50 text-rose-700 border-rose-200",
    };

    return (
        <span className={`
      px-2.5 py-0.5 rounded-md text-xs font-bold border
      ${styles[level] || "bg-slate-50 text-slate-600 border-slate-200"}
    `}>
            {level}
        </span>
    );
};

// --- Helper: Progress Bar ---
const ProgressBar = ({ percent }) => {
    const isComplete = percent === 100;

    return (
        <div className="w-full max-w-[140px]">
            <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-medium ${isComplete ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isComplete ? 'Completed' : `${percent}%`}
                </span>
                {isComplete && <CheckCircle2 size={12} className="text-emerald-500" />}
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
};

// --- Main Component ---
export default function ListeningPage() {
    const navigate = useNavigate();
    const [activePlayingId, setActivePlayingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterLevel, setFilterLevel] = useState("All");

    // Data state
    const [podcasts, setPodcasts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch podcasts from API
    useEffect(() => {
        const fetchPodcasts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getPodcasts();
                // Map API data to component format
                const mappedData = data.map(podcast => ({
                    id: podcast.id,
                    title: podcast.title,
                    author: podcast.context,
                    level: podcast.cefr_level,
                    deck: podcast.context,
                    duration: podcast.duration || "0:00",
                    progress: 0, // Can be implemented with user progress tracking
                    isFavorite: false
                }));
                setPodcasts(mappedData);
            } catch (err) {
                console.error('Failed to fetch podcasts:', err);
                setError('Failed to load podcasts');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPodcasts();
    }, []);

    // Handle filtering
    const filteredData = useMemo(() => {
        return podcasts.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.deck.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesLevel = filterLevel === "All" || item.level === filterLevel;
            return matchesSearch && matchesLevel;
        });
    }, [searchQuery, filterLevel, podcasts]);

    const togglePlay = (e, id) => {
        e.stopPropagation(); // Prevent row click
        setActivePlayingId(activePlayingId === id ? null : id);
    };

    const handleRowClick = (id) => {
        navigate(`/learning/listening/${id}`);
    };

    const handleCreateClick = () => {
        navigate('/learning/listening/create');
    };

    return (
        <div className="font-sans text-slate-900">

            <div className="max-w-6xl mx-auto">
                {/* Actions */}
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={handleCreateClick}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} />
                        Create
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search lessons, topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
                            <Filter size={16} />
                            <span className="hidden sm:inline">Level:</span>
                        </div>
                        {['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => setFilterLevel(lvl)}
                                className={`
                  px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                  ${filterLevel === lvl
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
                `}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 text-red-700 font-medium hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Main Table */}
                {!isLoading && !error && (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

                        {/* Table Header (Hidden on mobile, visible on lg) */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <div className="col-span-12 md:col-span-5 lg:col-span-4 pl-2">Title</div>
                            <div className="hidden md:block md:col-span-2 lg:col-span-2">Level</div>
                            <div className="hidden lg:block lg:col-span-2">Context</div>
                            <div className="hidden md:block md:col-span-3 lg:col-span-3">Progress</div>
                            <div className="hidden md:block md:col-span-2 lg:col-span-1 text-right">Action</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleRowClick(item.id)}
                                        className="group grid grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >

                                        {/* Title Column */}
                                        <div className="col-span-10 md:col-span-5 lg:col-span-4 flex items-center gap-4">
                                            {/* Play Button (Small screens: shown next to title) */}
                                            <button
                                                onClick={(e) => togglePlay(e, item.id)}
                                                className={`
                        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm
                        ${activePlayingId === item.id
                                                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                                                        : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600'}
                      `}
                                            >
                                                {activePlayingId === item.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                                            </button>

                                            <div className="min-w-0">
                                                <h3 className={`text-sm font-bold truncate ${activePlayingId === item.id ? 'text-indigo-600' : 'text-slate-800'}`}>
                                                    {item.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                                    <span className="truncate">{item.author}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    <span className="flex items-center gap-1"><Clock size={10} /> {item.duration}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Level Column */}
                                        <div className="hidden md:flex md:col-span-2 lg:col-span-2 items-center">
                                            <LevelBadge level={item.level} />
                                        </div>

                                        {/* Context Column */}
                                        <div className="hidden lg:flex lg:col-span-2 items-center">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                                <Book size={12} />
                                                {item.deck}
                                            </span>
                                        </div>

                                        {/* Progress Column */}
                                        <div className="hidden md:block md:col-span-3 lg:col-span-3">
                                            <ProgressBar percent={item.progress} />
                                        </div>

                                        {/* Action Column (Desktop) / Mobile Context */}
                                        <div className="col-span-2 md:col-span-2 lg:col-span-1 flex items-center justify-end gap-2">
                                            <button className={`p-2 rounded-full transition-colors ${item.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`} onClick={(e) => e.stopPropagation()}>
                                                <Heart size={18} fill={item.isFavorite ? "currentColor" : "none"} />
                                            </button>
                                            <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors" onClick={(e) => e.stopPropagation()}>
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>

                                        {/* Mobile Only: Progress & Level Info Row */}
                                        <div className="col-span-12 md:hidden mt-2 pt-3 border-t border-slate-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <LevelBadge level={item.level} />
                                                <span className="text-xs text-slate-400 font-medium">{item.deck}</span>
                                            </div>
                                            <div className="w-24">
                                                <ProgressBar percent={item.progress} />
                                            </div>
                                        </div>

                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                                        <Search size={32} className="opacity-20" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700">
                                        {podcasts.length === 0 ? 'No podcasts yet' : 'No lessons found'}
                                    </h3>
                                    <p className="text-sm">
                                        {podcasts.length === 0
                                            ? 'Create your first podcast to get started.'
                                            : 'Try adjusting your search or filters.'}
                                    </p>
                                    {podcasts.length === 0 ? (
                                        <button
                                            onClick={handleCreateClick}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                                        >
                                            <Plus size={16} />
                                            Create Podcast
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => { setSearchQuery(""); setFilterLevel("All") }}
                                            className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-bold"
                                        >
                                            Clear all filters
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination Footer (Static for demo) */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <p className="text-xs text-slate-500">Showing <span className="font-bold text-slate-700">{filteredData.length}</span> results</p>
                            <div className="flex gap-2">
                                <button disabled className="px-3 py-1 text-xs font-bold text-slate-400 bg-white border border-slate-200 rounded-md cursor-not-allowed">Previous</button>
                                <button className="px-3 py-1 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-md hover:border-indigo-300 hover:text-indigo-600">Next</button>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}
