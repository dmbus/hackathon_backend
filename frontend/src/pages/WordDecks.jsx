import {
    Book,
    Briefcase,
    ChevronRight,
    Coffee,
    Filter,
    Plane,
    Plus,
    Star,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wordService } from '../services/wordService';

// --- Icon Mapping ---
const ICON_MAP = {
    "Coffee": Coffee,
    "Briefcase": Briefcase,
    "Plane": Plane,
    "Star": Star,
    "Book": Book
};

// --- Sub-Components ---

const LevelBadge = ({ level }) => {
    const getColors = (lvl) => {
        if (!lvl) return "bg-slate-100 text-slate-600 border-slate-200";
        const l = lvl.toUpperCase();
        if (l.startsWith('A')) return "bg-green-100 text-green-700 border-green-200";
        if (l.startsWith('B')) return "bg-blue-100 text-blue-700 border-blue-200";
        if (l.startsWith('C')) return "bg-rose-100 text-rose-700 border-rose-200";
        return "bg-slate-100 text-slate-600 border-slate-200";
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getColors(level)} flex items-center gap-1`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
            {level}
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

// --- Main Page ---

const WordDecks = () => {
    const navigate = useNavigate();
    const [decks, setDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const data = await wordService.getDecks();
                setDecks(data);
            } catch (error) {
                console.error("Failed to fetch decks", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDecks();
    }, []);

    const levels = [...new Set(decks.map(d => d.level))].sort();
    const topics = [...new Set(decks.map(d => d.category))].sort();

    const filteredDecks = decks.filter(deck => {
        const matchLevel = selectedLevel ? deck.level === selectedLevel : true;
        const matchTopic = selectedTopic ? deck.category === selectedTopic : true;
        return matchLevel && matchTopic;
    });

    const clearFilters = () => {
        setSelectedLevel(null);
        setSelectedTopic(null);
    };

    const onSelectDeck = (deck) => {
        navigate(`/learning/words/${deck.id}`);
    };

    const onCreateDeck = () => {
        // Logic to create deck
        console.log("Create deck");
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20">
            <div className="mb-8 text-center md:text-left md:flex md:items-end md:justify-between">
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-indigo-600 mb-2">Language Learning</h4>
                    <h1 className="font-extrabold tracking-tight text-slate-900 text-3xl md:text-4xl">My Library</h1>
                    <p className="mt-2 text-slate-500 max-w-lg">Manage your collection of word decks.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center text-slate-400 text-sm font-semibold uppercase tracking-wider gap-2">
                    <Filter size={16} /> Filters:
                </div>
                <div className="flex flex-wrap gap-2">
                    {levels.map(lvl => (
                        <button key={lvl} onClick={() => setSelectedLevel(selectedLevel === lvl ? null : lvl)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedLevel === lvl ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
                            {lvl}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-slate-200 mx-2 hidden md:block"></div>
                    {topics.map(topic => (
                        <button key={topic} onClick={() => setSelectedTopic(selectedTopic === topic ? null : topic)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedTopic === topic ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'}`}>
                            {topic}
                        </button>
                    ))}
                    {(selectedLevel || selectedTopic) && (
                        <button onClick={clearFilters} className="ml-auto px-3 py-1.5 rounded-full text-xs font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-1">
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading your decks...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDecks.map((deck) => {
                        const Icon = ICON_MAP[deck.icon] || Coffee;
                        return (
                            <div key={deck.id} onClick={() => onSelectDeck(deck)} className="group bg-white rounded-2xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col h-full">
                                <div className="p-6 pb-0 flex justify-between items-start">
                                    <div className={`p-4 rounded-xl ${deck.theme === 'rose' ? 'bg-rose-50 text-rose-600' : deck.theme === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <Icon size={28} strokeWidth={2} />
                                    </div>
                                    {deck.isCustom && <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">CUSTOM</span>}
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">{deck.wordCount} Words</span>
                                        {deck.progress === 100 && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={10} fill="currentColor" /> Mastered</span>}
                                    </div>
                                    <h3 className="font-extrabold tracking-tight text-slate-800 text-xl mb-2 group-hover:text-indigo-600 transition-colors">{deck.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">{deck.description}</p>
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <LevelBadge level={deck.level} />
                                        <button className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                    {deck.progress > 0 && deck.progress < 100 && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1"><span>Progress</span><span>{deck.progress}%</span></div>
                                            <ProgressBar progress={deck.progress} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={onCreateDeck} className="group border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:bg-white group-hover:text-indigo-500 group-hover:shadow-md transition-all"><Plus size={32} /></div>
                        <h3 className="font-extrabold text-slate-800 text-lg mb-1 group-hover:text-indigo-600">Create Custom Deck</h3>
                        <p className="text-slate-500 text-sm max-w-[200px]">Build your own flashcard set from saved words.</p>
                    </button>
                </div>
            )}
        </div>
    );
};

export default WordDecks;
