import { BookOpen, Briefcase, Coffee, Filter, GraduationCap, Heart, Layers, MoreHorizontal, Music, Plane, Star, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Mock Data ---
const DECKS = [
    {
        id: 1,
        title: "Daily Essentials",
        description: "Must-know words for everyday survival and basic conversation.",
        level: "A1",
        category: "General",
        wordCount: 150,
        progress: 45, // percentage
        icon: Coffee,
        theme: "indigo"
    },
    {
        id: 2,
        title: "Travel & Transport",
        description: "Airports, trains, directions, and booking accommodations.",
        level: "A2",
        category: "Travel",
        wordCount: 85,
        progress: 12,
        icon: Plane,
        theme: "blue"
    },
    {
        id: 3,
        title: "Business Professional",
        description: "Office terminology, negotiations, and formal correspondence.",
        level: "B1",
        category: "Business",
        wordCount: 240,
        progress: 0,
        icon: Briefcase,
        theme: "slate"
    },
    {
        id: 4,
        title: "Academic Arts",
        description: "Literature, history, and detailed descriptive vocabulary.",
        level: "C1",
        category: "Academic",
        wordCount: 310,
        progress: 68,
        icon: GraduationCap,
        theme: "rose"
    },
    {
        id: 5,
        title: "Music & Culture",
        description: "Discussing instruments, genres, and cultural events.",
        level: "B2",
        category: "Arts",
        wordCount: 120,
        progress: 100,
        icon: Music,
        theme: "indigo"
    },
    {
        id: 6,
        title: "Romance & Relationships",
        description: "Expressing feelings, personality traits, and emotions.",
        level: "B1",
        category: "Social",
        wordCount: 95,
        progress: 5,
        icon: Heart,
        theme: "rose"
    }
];

// --- Components ---

const LevelBadge = ({ level }) => {
    // Mapping level to color intensity based on the design system semantic roots
    const getColors = (lvl) => {
        const l = lvl.toUpperCase();
        if (l.startsWith('A')) return "bg-green-100 text-green-700 border-green-200";
        if (l.startsWith('B')) return "bg-blue-100 text-blue-700 border-blue-200"; // Using Semantic "Male Voice" Blue tokens
        if (l.startsWith('C')) return "bg-rose-100 text-rose-700 border-rose-200"; // Using Semantic "Female Voice" Rose tokens
        return "bg-slate-100 text-slate-600 border-slate-200";
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getColors(level)} flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            CEFR {level}
        </span>
    );
};

const ProgressBar = ({ progress }) => {
    return (
        <div className="w-full h-2 bg-slate-100 rounded-full mt-4 overflow-hidden">
            <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

const DeckCard = ({ deck, onStartFlashcards }) => {
    const Icon = deck.icon;

    const handleStartFlashcards = (e) => {
        e.stopPropagation();
        onStartFlashcards(deck.level);
    };

    return (
        <div className="group bg-white rounded-2xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col h-full">
            {/* Card Header / Icon Area */}
            <div className="p-6 pb-0 flex justify-between items-start">
                <div className={`p-4 rounded-xl ${deck.theme === 'rose' ? 'bg-rose-50 text-rose-600' : deck.theme === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Icon size={28} strokeWidth={2} />
                </div>

                {/* Options Button (Micro-interaction) */}
                <button className="p-2 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-grow flex flex-col">
                {/* Meta Label */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        {deck.wordCount} Words
                    </span>
                    {deck.progress === 100 && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> Mastered
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-extrabold tracking-tight text-slate-800 text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                    {deck.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                    {deck.description}
                </p>

                {/* Footer: Level & Action */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <LevelBadge level={deck.level} />

                    <button
                        onClick={handleStartFlashcards}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium"
                    >
                        <Layers size={16} />
                        Flashcards
                    </button>
                </div>

                {/* Progress Bar (Only if started) */}
                {deck.progress > 0 && deck.progress < 100 && (
                    <div className="mt-4">
                        <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                            <span>Progress</span>
                            <span>{deck.progress}%</span>
                        </div>
                        <ProgressBar progress={deck.progress} />
                    </div>
                )}
            </div>
        </div>
    );
};

const Header = () => (
    <div className="mb-8 text-center md:text-left md:flex md:items-end md:justify-between">
        <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-2">
                Language Learning
            </h4>
            <h1 className="font-extrabold tracking-tight text-slate-900 text-3xl md:text-4xl">
                My Library
            </h1>
            <p className="mt-2 text-slate-500 max-w-lg">
                Manage your collection of word decks. Filter by level or topic to find exactly what you need.
            </p>
        </div>

        <div className="mt-6 md:mt-0 flex gap-3">
            <button className="px-5 py-2.5 rounded-full bg-indigo-600 text-white font-semibold text-sm shadow-md hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2">
                <BookOpen size={16} />
                Browse Store
            </button>
        </div>
    </div>
);

// --- Main Page Component ---

const DecksPage = () => {
    const navigate = useNavigate();
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);

    // Extract unique values for filters
    const levels = [...new Set(DECKS.map(d => d.level))].sort();
    const topics = [...new Set(DECKS.map(d => d.category))].sort();

    const handleStartFlashcards = (level) => {
        navigate(`/learning/words/${level}/flashcards`);
    };

    // Filter Logic
    const filteredDecks = DECKS.filter(deck => {
        const matchLevel = selectedLevel ? deck.level === selectedLevel : true;
        const matchTopic = selectedTopic ? deck.category === selectedTopic : true;
        return matchLevel && matchTopic;
    });

    const clearFilters = () => {
        setSelectedLevel(null);
        setSelectedTopic(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

                <Header />

                {/* Fast Filters Section */}
                <div className="mb-8 space-y-4">

                    {/* Filter Row */}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center text-slate-400 text-sm font-semibold uppercase tracking-wider gap-2">
                            <Filter size={16} />
                            Filters:
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {/* Level Filters */}
                            {levels.map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedLevel === lvl
                                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {lvl}
                                </button>
                            ))}

                            <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>

                            {/* Topic Filters */}
                            {topics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTopic === topic
                                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                                        }`}
                                >
                                    {topic}
                                </button>
                            ))}

                            {/* Clear Button */}
                            {(selectedLevel || selectedTopic) && (
                                <button
                                    onClick={clearFilters}
                                    className="ml-auto md:ml-2 px-3 py-1.5 rounded-full text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-1 transition-colors"
                                >
                                    <X size={14} /> Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDecks.map((deck) => (
                        <DeckCard key={deck.id} deck={deck} onStartFlashcards={handleStartFlashcards} />
                    ))}

                    {/* "Create New" Placeholder Card - Only show if no filters or if looking for creation */}
                    {!selectedLevel && !selectedTopic && (
                        <div className="group border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 h-full min-h-[300px]">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-md transition-all duration-300">
                                <span className="text-3xl font-light">+</span>
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-lg mb-1 group-hover:text-indigo-600">Create Custom Deck</h3>
                            <p className="text-slate-500 text-sm max-w-[200px]">
                                Build your own flashcard set from saved words.
                            </p>
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredDecks.length === 0 && (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 py-20 text-center text-slate-400">
                            <p>No decks found matching your filters.</p>
                            <button onClick={clearFilters} className="mt-2 text-indigo-600 font-semibold hover:underline">Clear all filters</button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DecksPage;
