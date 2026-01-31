import {
    BookOpen,
    ChevronRight,
    Mic2,
    MoreHorizontal,
    Play,
    Star,
    Volume2
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

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
                        <SectionHeader overline="Listening Skills" title="Daily Audio Digest" />
                        <Card className="p-0">
                            <div className="p-6 flex items-center gap-4 border-b border-slate-100">
                                <button
                                    onClick={() => setIsAudioPlaying(!isAudioPlaying)}
                                    className="p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md active:scale-90"
                                >
                                    {isAudioPlaying ? <div className="flex gap-1"><div className="w-1 h-4 bg-white animate-pulse"></div><div className="w-1 h-4 bg-white animate-pulse delay-75"></div></div> : <Play fill="white" size={20} />}
                                </button>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">L'économie Circulaire en France</h4>
                                    <p className="text-xs font-mono text-slate-400">03:45 / 12:20 • Intermediate</p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2">
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Star size={20} /></button>
                                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><MoreHorizontal size={20} /></button>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-600 italic">"Comprendre les enjeux du recyclage..."</span>
                                <button className="text-xs font-bold text-indigo-600 uppercase tracking-widest hover:underline">Take comprehension test</button>
                            </div>
                        </Card>
                    </section>
                </div>

                {/* Sidebar Stats Column */}
                <div className="space-y-8">
                    {/* Subscription Status */}
                    <Card className="p-6 bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-600 rounded-full blur-3xl opacity-30"></div>
                        <SectionHeader overline="Membership" title="" />
                        <h3 className="text-xl font-extrabold mb-2">Sprache.app Plus</h3>
                        <p className="text-slate-400 text-sm mb-6 font-medium">Unlimited practice, offline mode, and advanced AI tutor features active.</p>
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-2">
                            <span>Next billing date</span>
                            <span>Oct 12, 2024</span>
                        </div>
                        <button className="w-full py-3 bg-white text-slate-900 rounded-full font-bold shadow-lg hover:bg-slate-100 active:scale-95 transition-all text-sm">
                            Manage Subscription
                        </button>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default LearningDashboard;
