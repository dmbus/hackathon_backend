import {
    BookOpen,
    ChevronRight,
    Headphones,
    Loader2,
    Mic2,
    Play,
    Volume2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPodcasts } from '../services/podcastService';

// --- Shared Components (can be moved later) ---
const Card = ({ children, className = "", ...props }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${className}`} {...props}>
        {children}
    </div>
);

const SectionHeader = ({ overline, title }) => (
    <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">{overline}</p>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800">{title}</h2>
    </div>
);

const LearningDashboard = () => {
    const navigate = useNavigate();
    const [latestPodcast, setLatestPodcast] = useState(null);
    const [podcastLoading, setPodcastLoading] = useState(true);

    // Fetch latest podcast on mount
    useEffect(() => {
        const fetchLatestPodcast = async () => {
            try {
                const podcasts = await getPodcasts({ limit: 1 });
                if (podcasts && podcasts.length > 0) {
                    setLatestPodcast(podcasts[0]);
                }
            } catch (error) {
                console.error('Failed to fetch podcast:', error);
            } finally {
                setPodcastLoading(false);
            }
        };
        fetchLatestPodcast();
    }, []);

    // Format duration for display
    const formatDuration = (duration) => {
        if (!duration) return '0:00';
        // If duration is already in MM:SS format, return as is
        if (typeof duration === 'string' && duration.includes(':')) return duration;
        // If duration is in seconds, convert to MM:SS
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Get CEFR level label
    const getLevelLabel = (level) => {
        const labels = {
            'A1': 'Beginner',
            'A2': 'Elementary',
            'B1': 'Intermediate',
            'B2': 'Upper Intermediate',
            'C1': 'Advanced',
            'C2': 'Proficient'
        };
        return labels[level] || level;
    };

    return (
        <>
            {/* Top Bar / Mobile Header already in Layout, but we might want content here? 
                Actually the layout usually handles the persisted header. 
                Existing LearningPage had the header INSIDE renderContent? 
                No, the header was OUTSIDE renderContent in 'Main Content Area'.
                So we ONLY need the 'renderContent' part for 'dashboard' here.
            */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Learning Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Deck / Flashcards */}
                    <section>
                        <SectionHeader overline="Continue Learning" title="Vocabulary Decks" />
                        <Card className="p-6 flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-white to-slate-50">
                            <div className="w-32 h-32 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                                <BookOpen size={48} />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-md">B2 UPPER INTERMEDIATE</span>
                                    <span className="text-slate-400 text-xs font-medium">BUSINESS FRENCH</span>
                                </div>
                                <h3 className="text-xl font-extrabold text-slate-800 mb-2">Corporate Negotiations</h3>
                                <p className="text-slate-500 text-sm mb-4">42 words left to master in this deck.</p>
                                <div className="w-full bg-slate-200 h-2 rounded-full mb-4">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                                <button className="px-8 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
                                    Practice Flashcards
                                </button>
                            </div>
                        </Card>
                    </section>

                    {/* Practice Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Speaking Practice */}
                        <Card onClick={() => navigate('/learning/speaking')} className="p-6 hover:border-indigo-300 transition-colors group cursor-pointer">
                            <div className="p-3 bg-rose-50 rounded-xl w-fit mb-4 group-hover:bg-rose-100 transition-colors">
                                <Mic2 className="text-rose-500" size={24} />
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-800 mb-1">Speaking Practice</h3>
                            <p className="text-slate-500 text-sm mb-4">Simulate real-world conversations with AI feedback.</p>
                            <div className="flex items-center text-indigo-600 font-bold text-sm">
                                Start Session <ChevronRight size={16} />
                            </div>
                        </Card>

                        {/* Pronunciation Trainer */}
                        <Card className="p-6 hover:border-indigo-300 transition-colors group cursor-pointer">
                            <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4 group-hover:bg-blue-100 transition-colors">
                                <Volume2 className="text-blue-500" size={24} />
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-800 mb-1">Pronunciation Trainer</h3>
                            <p className="text-slate-500 text-sm mb-4">Master difficult phonemes and tonal inflections.</p>
                            <div className="flex items-center text-indigo-600 font-bold text-sm">
                                Open Lab <ChevronRight size={16} />
                            </div>
                        </Card>
                    </div>

                    {/* Audio Lesson Player */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <SectionHeader overline="Latest Podcast" title="Listening Practice" />
                            <button 
                                onClick={() => navigate('/learning/listening')}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                                View All <ChevronRight size={16} />
                            </button>
                        </div>
                        
                        {podcastLoading ? (
                            <Card className="p-12 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                            </Card>
                        ) : latestPodcast ? (
                            <Card className="p-0 hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => navigate(`/learning/listening/${latestPodcast.id}`)}>
                                <div className="p-6 flex items-center gap-4 border-b border-slate-100">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/learning/listening/${latestPodcast.id}`);
                                        }}
                                        className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md active:scale-90"
                                    >
                                        <Play fill="white" size={20} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate">{latestPodcast.title}</h4>
                                        <p className="text-xs font-mono text-slate-400">
                                            {formatDuration(latestPodcast.duration)} • {getLevelLabel(latestPodcast.cefr_level)}
                                        </p>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-2">
                                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-md">
                                            {latestPodcast.cefr_level}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 truncate flex-1">
                                        {latestPodcast.context}
                                    </span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/learning/listening/${latestPodcast.id}`);
                                        }}
                                        className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline ml-4 whitespace-nowrap"
                                    >
                                        Listen Now
                                    </button>
                                </div>
                            </Card>
                        ) : (
                            <Card className="p-8 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Headphones size={32} className="text-slate-400" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-2">No Podcasts Yet</h4>
                                <p className="text-slate-500 text-sm mb-4">Create your first podcast to start practicing your listening skills.</p>
                                <button 
                                    onClick={() => navigate('/learning/listening/create')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                                >
                                    Create Podcast
                                </button>
                            </Card>
                        )}
                    </section>
                </div>

                {/* Sidebar Stats Column */}
                <div className="space-y-8">
                    {/* Subscription Status */}
                    <Card className="p-8 bg-slate-900 text-white relative overflow-hidden min-h-[400px] flex flex-col">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <SectionHeader overline="Membership" title="" />
                            <h3 className="text-2xl font-extrabold mb-3">Sprache.app Plus</h3>
                            <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">Unlimited practice, offline mode, and advanced AI tutor features active.</p>
                            <div className="flex-1"></div>
                            <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-6">
                                <span>Next billing date</span>
                                <span>Oct 12, 2024</span>
                            </div>
                            <button className="w-full py-3 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:bg-slate-100 active:scale-95 transition-all text-sm">
                                Manage Subscription
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default LearningDashboard;
