import {
    ChevronLeft,
    Filter,
    Layers,
    Search,
    Volume2
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wordService } from '../services/wordService';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${styles[level] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
            {level}
        </span>
    );
};

// --- Helper: Progress Bar (7 squares) ---
const ProgressSquares = ({ level }) => {
    const squares = Array(7).fill(0);
    const isMastered = level === 7;

    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5" title={`Progress: ${level}/7`}>
                {squares.map((_, index) => (
                    <div
                        key={index}
                        className={`w-3 h-3 rounded-sm transition-colors duration-300 ${index < level ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    />
                ))}
            </div>
            <span className={`ml-2 text-xs font-medium ${isMastered ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isMastered ? 'Mastered' : `${level}/7`}
            </span>
        </div>
    );
};

// --- Helper: Voice Button ---
const VoiceButton = ({ gender, audioUrl, word }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const isFemale = gender === 'female';
    const baseClass = isFemale
        ? "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border-rose-200"
        : "bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white border-blue-200";
    const activeClass = isFemale
        ? "bg-rose-500 text-white border-rose-500"
        : "bg-blue-500 text-white border-blue-500";

    const playAudio = (e) => {
        e.stopPropagation();

        // Construct full URL from relative path (e.g., /audio/word_m.mp3 -> http://localhost:8000/audio/word_m.mp3)
        // Check if it's already an absolute URL (e.g. from Hetzner bucket)
        const fullAudioUrl = audioUrl
            ? (audioUrl.startsWith('http') ? audioUrl : `${API_URL}${audioUrl}`)
            : null;

        if (fullAudioUrl) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            audioRef.current = new Audio(fullAudioUrl);
            audioRef.current.onplay = () => setIsPlaying(true);
            audioRef.current.onended = () => setIsPlaying(false);
            audioRef.current.onerror = () => {
                setIsPlaying(false);
                // Fallback to speech synthesis
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'de-DE';
                if (isFemale) utterance.pitch = 1.2;
                else utterance.pitch = 0.8;
                window.speechSynthesis.speak(utterance);
            };
            audioRef.current.play();
        } else {
            // Fallback to speech synthesis
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'de-DE';
            if (isFemale) utterance.pitch = 1.2;
            else utterance.pitch = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <button
            onClick={playAudio}
            className={`p-2 rounded-full border transition-all duration-200 ${isPlaying ? activeClass : baseClass}`}
            title={`Play ${gender} voice`}
        >
            <Volume2 size={16} />
        </button>
    );
};

// --- Main Component ---
export default function WordDeckDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deckInfo, setDeckInfo] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [wordsData, decksData] = await Promise.all([
                    wordService.getWordsByLevel(id),
                    wordService.getDecks()
                ]);
                setWords(wordsData);
                const deck = decksData.find(d => d.id === id);
                setDeckInfo(deck || { title: `Level ${id}`, wordCount: wordsData.length });
            } catch (error) {
                console.error("Failed to load words", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Filter words by search query
    const filteredWords = useMemo(() => {
        return words.filter(word => {
            const matchesSearch = word.original.toLowerCase().includes(searchQuery.toLowerCase()) ||
                word.translation.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [words, searchQuery]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="font-sans text-slate-900">
            <div className="max-w-6xl mx-auto">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/learning/words')}
                    className="flex items-center text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors"
                >
                    <ChevronLeft size={20} /> Back to Word Decks
                </button>

                {/* Header Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LevelBadge level={id} />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">{deckInfo?.title || `Level ${id}`}</h1>
                            <p className="text-slate-500">{deckInfo?.wordCount || words.length} words in this deck</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(`/learning/words/${id}/flashcards`)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Layers size={20} />
                        Flashcards
                    </button>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">

                    {/* Search */}
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search words..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                        />
                    </div>

                    {/* Results count */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Filter size={16} />
                        <span>Showing <span className="font-bold text-slate-700">{filteredWords.length}</span> words</span>
                    </div>
                </div>

                {/* Main Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">

                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-12 md:col-span-4 lg:col-span-3">Word</div>
                        <div className="hidden md:block md:col-span-2 lg:col-span-3">IPA</div>
                        <div className="hidden md:block md:col-span-3 lg:col-span-2 text-center">Voice</div>
                        <div className="hidden md:block md:col-span-3 lg:col-span-4">Progress</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-slate-100">
                        {filteredWords.length > 0 ? (
                            filteredWords.map((word) => (
                                <div
                                    key={word.id}
                                    className="group grid grid-cols-12 gap-4 items-center px-4 md:px-6 py-4 hover:bg-slate-50 transition-colors"
                                >
                                    {/* Word Column */}
                                    <div className="col-span-10 md:col-span-4 lg:col-span-3">
                                        <h3 className="text-sm font-bold text-slate-800">
                                            {word.original}
                                        </h3>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                                            {word.translation}
                                        </p>
                                    </div>

                                    {/* IPA Column */}
                                    <div className="hidden md:flex md:col-span-2 lg:col-span-3 items-center">
                                        <span className="text-sm font-mono text-slate-500">
                                            {word.pronunciation ? `/${word.pronunciation}/` : '—'}
                                        </span>
                                    </div>

                                    {/* Voice Column */}
                                    <div className="hidden md:flex md:col-span-3 lg:col-span-2 items-center justify-center gap-2">
                                        <VoiceButton gender="female" audioUrl={word.audioFemale} word={word.original} />
                                        <VoiceButton gender="male" audioUrl={word.audioMale} word={word.original} />
                                    </div>

                                    {/* Progress Column */}
                                    <div className="hidden md:block md:col-span-3 lg:col-span-4">
                                        <ProgressSquares level={word.level} />
                                    </div>

                                    {/* Mobile Action */}
                                    <div className="col-span-2 md:hidden flex items-center justify-end gap-1">
                                        <VoiceButton gender="female" audioUrl={word.audioFemale} word={word.original} />
                                        <VoiceButton gender="male" audioUrl={word.audioMale} word={word.original} />
                                    </div>

                                    {/* Mobile Only: IPA & Progress Row */}
                                    <div className="col-span-12 md:hidden mt-2 pt-3 border-t border-slate-50 flex items-center justify-between">
                                        <span className="text-xs font-mono text-slate-400">
                                            {word.pronunciation ? `/${word.pronunciation}/` : '—'}
                                        </span>
                                        <ProgressSquares level={word.level} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <Search size={32} className="opacity-20" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700">No words found</h3>
                                <p className="text-sm">Try adjusting your search.</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-bold"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                            Showing <span className="font-bold text-slate-700">{filteredWords.length}</span> of <span className="font-bold text-slate-700">{words.length}</span> words
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
