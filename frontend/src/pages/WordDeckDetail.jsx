import {
    Book,
    Briefcase,
    CheckCircle,
    ChevronLeft,
    ClipboardList,
    Coffee,
    Lock,
    Plane,
    Play,
    Plus,
    Star,
    Trash2,
    Volume2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const VoiceButton = ({ gender, onClick }) => {
    const isFemale = gender === 'female';
    const colorClass = isFemale
        ? "bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white border-rose-200"
        : "bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white border-blue-200";

    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`p-2 rounded-full border transition-all duration-200 ${colorClass}`}
            title={`Play ${gender} voice`}
        >
            <Volume2 size={16} />
        </button>
    );
};

const SpacedRepetitionProgress = ({ level }) => {
    // 7 squares total
    const squares = Array(7).fill(0);

    return (
        <div className="flex gap-1" title={`Spaced Repetition Level: ${level}/7`}>
            {squares.map((_, index) => (
                <div
                    key={index}
                    className={`w-3 h-3 rounded-sm transition-colors duration-300 ${index < level ? 'bg-green-500' : 'bg-slate-200'
                        }`}
                />
            ))}
        </div>
    );
};

// --- Main Page ---

const WordDeckDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [deck, setDeck] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newWord, setNewWord] = useState({ original: '', translation: '' });
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch words for the level (id is the level, e.g., "A1")
                const wordsData = await wordService.getWordsByLevel(id);

                // For metadata, we need to fetch decks and find the matching one to get theme/desc
                const decksData = await wordService.getDecks();
                const deckMeta = decksData.find(d => d.id === id);

                if (deckMeta) {
                    setDeck({
                        ...deckMeta,
                        words: wordsData,
                        icon: deckMeta.icon // Needs handling if it's a string, done below
                    });
                } else {
                    // Fallback if deck not found in list (e.g. direct link to invalid level)
                    setDeck({
                        id: id,
                        title: `Level ${id}`,
                        description: `Words for level ${id}`,
                        level: id,
                        words: wordsData,
                        theme: 'indigo',
                        isCustom: false,
                        progress: 0,
                        icon: "Book"
                    });
                }
            } catch (error) {
                console.error("Failed to load deck", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!deck) {
        return <div className="p-8 text-center text-slate-500">Deck not found</div>;
    }

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newWord.original || !newWord.translation) return;

        const newWordEntry = {
            id: Date.now(),
            original: newWord.original,
            translation: newWord.translation,
            pronunciation: "",
            level: 0
        };

        setDeck(prev => ({
            ...prev,
            wordCount: (prev.words?.length || 0) + 1,
            words: [...(prev.words || []), newWordEntry]
        }));

        setNewWord({ original: '', translation: '' });
        setIsAdding(false);
    };

    const onDeleteWord = (wordId) => {
        setDeck(prev => ({
            ...prev,
            wordCount: Math.max(0, (prev.words?.length || 0) - 1),
            words: prev.words.filter(w => w.id !== wordId)
        }));
    };

    const playAudio = (text, gender) => {
        const utterance = new SpeechSynthesisUtterance(text);
        // Simple voice selection hint
        if (gender === 'Male') utterance.pitch = 0.8;
        if (gender === 'Female') utterance.pitch = 1.2;
        window.speechSynthesis.speak(utterance);
    };

    const Icon = ICON_MAP[deck.icon] || Book;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            {/* Navigation & Header */}
            <button onClick={() => navigate('/learning/words')} className="flex items-center text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors">
                <ChevronLeft size={20} /> Back to Library
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
                {/* Banner */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex gap-6">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${deck.theme === 'rose' ? 'bg-rose-100 text-rose-600' : deck.theme === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                <Icon size={40} strokeWidth={1.5} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-extrabold text-slate-900">{deck.title}</h1>
                                    {deck.isCustom ? (
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded uppercase tracking-wide">Custom Deck</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wide flex items-center gap-1"><Lock size={10} /> Locked</span>
                                    )}
                                </div>
                                <p className="text-slate-600 max-w-xl leading-relaxed">{deck.description}</p>

                                <div className="flex items-center gap-6 mt-4 text-sm font-medium text-slate-500">
                                    <span className="flex items-center gap-2"><BookOpen size={16} /> {deck.words?.length || 0} Words</span>
                                    <span className="flex items-center gap-2"><CheckCircle size={16} /> {deck.progress}% Mastered</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 self-start">
                            <button className="px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm">
                                <ClipboardList size={18} /> Test
                            </button>
                            <button
                                onClick={() => navigate(`/learning/words/${id}/flashcards`)}
                                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200">
                                <Play size={18} fill="currentColor" /> Speak
                            </button>
                        </div>
                    </div>
                </div>

                {/* Word List Content */}
                <div className="p-0">
                    {/* Add Word Row (Custom Decks Only) */}
                    {deck.isCustom && (
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            {!isAdding ? (
                                <button onClick={() => setIsAdding(true)} className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-semibold hover:border-indigo-400 hover:text-indigo-600 hover:bg-white transition-all flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add New Word
                                </button>
                            ) : (
                                <form onSubmit={handleAdd} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex-1">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Word (e.g., Bonjour)"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newWord.original}
                                            onChange={e => setNewWord({ ...newWord, original: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Translation (e.g., Hello)"
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newWord.translation}
                                            onChange={e => setNewWord({ ...newWord, translation: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Add</button>
                                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* Table */}
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-8 py-4 w-1/4">Word</th>
                                <th className="px-8 py-4 w-1/4">Translation</th>
                                <th className="px-8 py-4 w-1/6 text-center">Pronunciation</th>
                                <th className="px-8 py-4 w-1/6">Retention</th>
                                {deck.isCustom && <th className="px-8 py-4 w-16"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {deck.words && deck.words.length > 0 ? (
                                deck.words.map((word) => (
                                    <tr key={word.id} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-bold text-slate-800 text-lg">{word.original}</span>
                                            {word.pronunciation && <span className="text-slate-400 text-sm font-mono ml-2">/{word.pronunciation}/</span>}
                                        </td>
                                        <td className="px-8 py-5 text-slate-600 font-medium">
                                            {word.translation}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center justify-center gap-3">
                                                <VoiceButton gender="female" onClick={() => playAudio(word.original, 'Female')} />
                                                <VoiceButton gender="male" onClick={() => playAudio(word.original, 'Male')} />
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col gap-1">
                                                <SpacedRepetitionProgress level={word.level} />
                                                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                                    {word.level === 7 ? 'Mastered' : 'Learning'}
                                                </span>
                                            </div>
                                        </td>
                                        {deck.isCustom && (
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => onDeleteWord(word.id)}
                                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-12 text-center text-slate-400 italic">
                                        This deck is empty. {deck.isCustom ? "Add some words to get started!" : "No words available."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WordDeckDetail;
