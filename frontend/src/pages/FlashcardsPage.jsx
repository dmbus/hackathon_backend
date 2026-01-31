import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCcw, RotateCw, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { wordService } from '../services/wordService';

// --- Flashcard Component ---
const Flashcard = ({ data, isActive }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isPlaying, setIsPlaying] = useState(null); // 'male' | 'female' | null

    // Reset flip state when card changes
    useEffect(() => {
        setIsFlipped(false);
    }, [data]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const playAudio = useCallback((e, gender) => {
        e.stopPropagation(); // Prevent card flip when clicking audio

        // Stop any current playing audio
        window.speechSynthesis.cancel();
        setIsPlaying(gender);

        let audioUrl = gender === 'female' ? data.audioFemale : data.audioMale;

        // Use backend audio if available
        if (audioUrl) {
            const fullAudioUrl = audioUrl.startsWith('http') ? audioUrl : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${audioUrl}`;
            const audio = new Audio(fullAudioUrl);
            audio.onended = () => setIsPlaying(null);
            audio.onerror = () => {
                // Fallback to TTS
                speak(gender);
            };
            audio.play().catch(() => speak(gender));
        } else {
            speak(gender);
        }

        function speak(gender) {
            if (!('speechSynthesis' in window)) {
                alert("Text-to-speech not supported in this browser.");
                setIsPlaying(null);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(data.targetWord);
            utterance.lang = data.language || 'fr-FR';
            utterance.rate = 0.9;
            if (gender === 'female') {
                utterance.pitch = 1.2;
            } else {
                utterance.pitch = 0.7;
            }
            utterance.onend = () => setIsPlaying(null);
            utterance.onerror = () => setIsPlaying(null);
            window.speechSynthesis.speak(utterance);
        }

    }, [data]);

    if (!data) return null;

    return (
        <div
            className="group perspective-1000 w-full max-w-md h-80 cursor-pointer"
            onClick={handleFlip}
        >
            <div
                className={`relative w-full h-full transition-all duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
            >
                {/* --- Front Side (Target Word) --- */}
                <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl flex flex-col items-center justify-center border border-slate-200">

                    {/* Audio Controls (Top Right) */}
                    <div className="absolute top-4 right-4 flex gap-3">
                        {/* Female Voice (Red) */}
                        <button
                            onClick={(e) => playAudio(e, 'female')}
                            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-rose-200 ${isPlaying === 'female'
                                ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-400'
                                : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                                }`}
                            aria-label="Listen to female pronunciation"
                            title="Female Voice"
                        >
                            <Volume2 size={24} strokeWidth={2.5} />
                        </button>

                        {/* Male Voice (Blue) */}
                        <button
                            onClick={(e) => playAudio(e, 'male')}
                            className={`p-2 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200 ${isPlaying === 'male'
                                ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-400'
                                : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                                }`}
                            aria-label="Listen to male pronunciation"
                            title="Male Voice"
                        >
                            <Volume2 size={24} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Center Content */}
                    <div className="text-center px-6">
                        <span className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Word
                        </span>
                        <h2 className="text-5xl font-bold text-slate-800 tracking-tight mb-2">
                            {data.targetWord}
                        </h2>
                        {data.phonetic && (
                            <p className="text-slate-400 font-mono text-lg opacity-80">
                                /{data.phonetic}/
                            </p>
                        )}
                    </div>

                    <div className="absolute bottom-6 text-slate-300 text-sm font-medium flex items-center gap-2">
                        <RotateCw size={14} /> Click to flip
                    </div>
                </div>

                {/* --- Back Side (Translation) --- */}
                <div
                    className="absolute w-full h-full backface-hidden bg-indigo-600 rounded-2xl flex flex-col items-center justify-center rotate-y-180 text-white shadow-inner"
                >
                    <div className="text-center px-6">
                        <span className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-3">
                            English Translation
                        </span>
                        <h2 className="text-4xl font-bold tracking-tight">
                            {data.translation}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Application Container ---
const FlashcardsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [vocabularyData, setVocabularyData] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sessionComplete, setSessionComplete] = useState(false);
    const [error, setError] = useState(null);

    const loadSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const session = await wordService.getFlashcardSession(id);
            console.log("Flashcard session:", session);
            if (session && session.words && session.words.length > 0) {
                setVocabularyData(session.words);
                setCurrentIndex(session.currentIndex);
                setSessionComplete(false);
            } else {
                setVocabularyData([]);
                setError("No words available for this level.");
            }
        } catch (err) {
            console.error("Failed to load session", err);
            setError("Failed to load flashcards.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    const handleProgressUpdate = async (newIndex) => {
        // Optimistically update UI
        setCurrentIndex(newIndex);
        // Send update to backend
        await wordService.updateFlashcardProgress(id, newIndex);
    };

    const nextCard = () => {
        if (currentIndex < vocabularyData.length - 1) {
            handleProgressUpdate(currentIndex + 1);
        } else {
            setSessionComplete(true);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            handleProgressUpdate(currentIndex - 1);
        }
    };

    const resetSession = async () => {
        await wordService.resetFlashcardSession(id);
        loadSession();
    };

    if (loading) {
        return (
            <div className="min-h-full bg-slate-50 flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-full bg-slate-50 flex flex-col items-center justify-center p-4 py-20">
                <div className="text-slate-500 mb-4">{error}</div>
                <button
                    onClick={() => navigate(`/learning/words/${id}`)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Back to Deck
                </button>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="min-h-full bg-slate-50 flex flex-col items-center justify-center p-4 py-20 font-sans text-slate-900">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 text-green-600 rounded-full mb-6">
                        <Check size={48} />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Session Complete!</h2>
                    <p className="text-slate-500 mb-8">You've reviewed all {vocabularyData.length} words in this session.</p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={resetSession}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={20} /> Start New Session
                        </button>
                        <button
                            onClick={() => navigate(`/learning/words/${id}`)}
                            className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
                        >
                            Back to Deck
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const goToCard = (index) => {
        handleProgressUpdate(index);
    };

    return (
        <div className="min-h-full bg-slate-50 py-6 px-4 font-sans text-slate-900">
            {/* Back Button */}
            <div className="max-w-6xl mx-auto mb-6">
                <button
                    onClick={() => navigate(`/learning/words/${id}`)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to Deck
                </button>
            </div>

            {/* Main Content: Flashcard + Word List */}
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* Left: Flashcard Area */}
                <div className="flex-1 flex flex-col items-center">
                    {!loading && vocabularyData.length === 0 && !error && (
                        <div className="text-slate-500">No words available.</div>
                    )}

                    <Flashcard
                        data={vocabularyData[currentIndex]}
                        isActive={true}
                    />

                    {/* Navigation Controls */}
                    <div className="flex items-center gap-8 mt-8">
                        <button
                            onClick={prevCard}
                            disabled={currentIndex === 0}
                            className={`p-4 rounded-full border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95 ${currentIndex === 0
                                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-200 text-slate-600 hover:shadow-md hover:bg-slate-50 hover:text-indigo-600'
                                }`}
                            aria-label="Previous card"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="text-sm font-medium text-slate-400">
                            {currentIndex + 1} / {vocabularyData.length}
                        </div>

                        <button
                            onClick={nextCard}
                            className="p-4 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:shadow-md hover:bg-slate-50 hover:text-indigo-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 active:scale-95"
                            aria-label="Next card"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Tip */}
                    <div className="mt-6 text-center text-slate-400 text-sm">
                        <p>Use <span className="text-rose-500 font-semibold">Red</span> for female voice, <span className="text-blue-500 font-semibold">Blue</span> for male.</p>
                    </div>
                </div>

                {/* Right: Word Collection Panel */}
                <div className="lg:w-80 bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700">Word Collection</h3>
                        <p className="text-xs text-slate-400 mt-1">{vocabularyData.length} words in this session</p>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                        {vocabularyData.map((word, index) => (
                            <button
                                key={word.id}
                                onClick={() => goToCard(index)}
                                className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                                    index === currentIndex ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''
                                }`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    index < currentIndex
                                        ? 'bg-green-100 text-green-600'
                                        : index === currentIndex
                                            ? 'bg-indigo-100 text-indigo-600'
                                            : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {index < currentIndex ? <Check size={14} /> : index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium truncate ${index === currentIndex ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        {word.targetWord}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">{word.translation}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        /* * Tailwind provides standard transforms, but some browsers 
         * need specific utilities for backface visibility and 3D preservation 
         */
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
};

export default FlashcardsPage;
