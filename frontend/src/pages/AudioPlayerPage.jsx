import {
    AlertCircle,
    BookOpen,
    Check,
    ChevronLeft,
    Clock,
    Download,
    GraduationCap,
    Loader2,
    Pause,
    Play,
    RotateCcw,
    Settings2,
    Volume2,
    VolumeX,
    X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPodcast } from '../services/podcastService';

// --- Helper: Format seconds to MM:SS ---
const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- Sub-Component: Transcript Item ---
const TranscriptSegment = ({ segment, index, isActive, onClick }) => {
    const activeRef = useRef(null);

    useEffect(() => {
        if (isActive && activeRef.current) {
            activeRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }, [isActive]);

    return (
        <div
            ref={activeRef}
            onClick={onClick}
            className={`
        p-4 rounded-xl cursor-pointer transition-all duration-300 border mb-3
        ${isActive
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[1.02]'
                    : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                }
      `}
        >
            <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {segment.speaker}
                </span>
                <span className="text-xs font-mono text-slate-300">
                    #{index + 1}
                </span>
            </div>
            <p className={`text-lg leading-relaxed ${isActive ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                {segment.text}
            </p>
        </div>
    );
};

// --- Sub-Component: Quiz Question ---
const QuizQuestion = ({ question, index, selectedAnswer, onSelectAnswer, showResult }) => {
    return (
        <div className="p-4 bg-white border border-slate-100 rounded-xl mb-4">
            <div className="flex items-start gap-3 mb-3">
                <span className="flex-shrink-0 w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                </span>
                <h4 className="text-slate-800 font-medium flex-1">{question.question}</h4>
            </div>

            <div className="space-y-2 ml-10">
                {question.options.map((option, optIdx) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrectOption = option === question.correct_answer;

                    let optionStyle = 'bg-slate-50 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
                    if (showResult) {
                        if (isCorrectOption) {
                            optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-700';
                        } else if (isSelected && !isCorrectOption) {
                            optionStyle = 'bg-red-50 border-red-300 text-red-700';
                        }
                    } else if (isSelected) {
                        optionStyle = 'bg-indigo-50 border-indigo-300 text-indigo-700';
                    }

                    return (
                        <button
                            key={optIdx}
                            onClick={() => !showResult && onSelectAnswer(option)}
                            disabled={showResult}
                            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all flex items-center justify-between ${optionStyle}`}
                        >
                            <span>{option}</span>
                            {showResult && isCorrectOption && <Check size={16} className="text-emerald-600" />}
                            {showResult && isSelected && !isCorrectOption && <X size={16} className="text-red-500" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main Component: Audio Player ---
export default function AudioPlayerPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    // Data state
    const [podcast, setPodcast] = useState(null);
    const [isLoadingPodcast, setIsLoadingPodcast] = useState(true);
    const [loadError, setLoadError] = useState(null);

    // Audio state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [isMuted, setIsMuted] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('transcript'); // 'transcript' | 'quiz'

    // Quiz state
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showQuizResults, setShowQuizResults] = useState(false);

    // Refs
    const audioRef = useRef(null);
    const progressBarRef = useRef(null);

    // Fetch podcast data
    useEffect(() => {
        const fetchPodcast = async () => {
            setIsLoadingPodcast(true);
            setLoadError(null);
            try {
                const data = await getPodcast(id);
                setPodcast(data);
            } catch (err) {
                console.error('Failed to fetch podcast:', err);
                setLoadError('Failed to load podcast. It may not exist.');
            } finally {
                setIsLoadingPodcast(false);
            }
        };

        if (id) {
            fetchPodcast();
        }
    }, [id]);

    // --- Audio Handlers ---

    const togglePlay = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        try {
            if (isPlaying) {
                audio.pause();
            } else {
                await audio.play();
            }
            setIsPlaying(!isPlaying);
            setError(null);
        } catch (err) {
            console.error("Playback error:", err);
            setIsPlaying(false);
            setError("Unable to play audio. The format might not be supported.");
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleError = (e) => {
        console.error("Audio resource error:", e);
        setError("Error loading audio file. Please check your connection.");
        setIsPlaying(false);
    };

    const handleSeek = (e) => {
        const audio = audioRef.current;
        const bar = progressBarRef.current;
        if (!audio || !bar) return;

        const rect = bar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const newTime = pos * duration;

        if (Number.isFinite(newTime)) {
            audio.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, currentTime - 10);
        }
    };

    const changeSpeed = () => {
        const speeds = [0.75, 1.0, 1.25, 1.5];
        const currentIndex = speeds.indexOf(playbackRate);
        const nextSpeed = speeds[(currentIndex + 1) % speeds.length];

        setPlaybackRate(nextSpeed);
        if (audioRef.current) {
            audioRef.current.playbackRate = nextSpeed;
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // --- Quiz Handlers ---
    const handleSelectAnswer = (questionIndex, answer) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleSubmitQuiz = () => {
        setShowQuizResults(true);
    };

    const handleResetQuiz = () => {
        setQuizAnswers({});
        setShowQuizResults(false);
    };

    // --- Derived State ---
    const progressPercent = duration ? (currentTime / duration) * 100 : 0;

    const quizScore = useMemo(() => {
        if (!podcast?.quiz || !showQuizResults) return null;
        const correct = podcast.quiz.filter(
            (q, idx) => quizAnswers[idx] === q.correct_answer
        ).length;
        return { correct, total: podcast.quiz.length };
    }, [podcast, quizAnswers, showQuizResults]);

    // Calculate active transcript line
    const activeTranscriptIndex = useMemo(() => {
        if (!podcast?.transcript) return -1;

        // Find the segment matching the current time
        // We use explicit start/end times if available
        return podcast.transcript.findIndex(seg => {
            if (seg.start_time === undefined || seg.end_time === undefined) return false;
            return currentTime >= seg.start_time && currentTime < seg.end_time;
        });
    }, [currentTime, podcast]);

    const handleTranscriptClick = (segment) => {
        if (segment.start_time !== undefined && audioRef.current) {
            audioRef.current.currentTime = segment.start_time;
            if (!isPlaying) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    // Loading state
    if (isLoadingPodcast) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    // Error state
    if (loadError || !podcast) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Podcast Not Found</h2>
                <p className="text-slate-500 mb-6">{loadError || 'The podcast you are looking for does not exist.'}</p>
                <button
                    onClick={() => navigate('/learning/listening')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    <ChevronLeft size={18} />
                    Back to Library
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 font-sans text-slate-900">

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={podcast.audio_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onError={handleError}
                preload="metadata"
                crossOrigin="anonymous"
            />

            {/* --- Top Navigation Bar --- */}
            <div className="w-full max-w-3xl mb-4">
                <button
                    onClick={() => navigate('/learning/listening')}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                    <ChevronLeft size={16} /> Back to Library
                </button>
            </div>

            {/* --- Header Area --- */}
            <header className="w-full max-w-3xl flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
                        <Volume2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{podcast.title}</h2>
                        <p className="text-slate-500 text-sm font-medium">{podcast.context} • {podcast.cefr_level}</p>
                    </div>
                </div>

                {/* Test Button */}
                <button
                    onClick={() => setActiveTab('quiz')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all font-bold text-sm ${activeTab === 'quiz'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                >
                    <GraduationCap size={18} />
                    Quiz ({podcast.quiz?.length || 0})
                </button>
            </header>

            <main className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">

                {/* --- Left Col: Audio Controls (Sticky) --- */}
                <section className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 flex flex-col items-center justify-between h-full relative overflow-hidden">

                        {/* Visualizer Art / Placeholder */}
                        <div className="w-full aspect-square bg-indigo-50 rounded-2xl mb-6 flex items-center justify-center relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-white opacity-50"></div>
                            {/* Animated Rings */}
                            {isPlaying && !error && (
                                <>
                                    <div className="absolute w-full h-full border-4 border-indigo-200 rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute w-2/3 h-2/3 border-4 border-indigo-300 rounded-full animate-pulse opacity-30"></div>
                                </>
                            )}
                            {error ? (
                                <AlertCircle className="text-red-400 relative z-10" size={64} />
                            ) : (
                                <Volume2 className={`text-indigo-500 relative z-10 transition-all duration-500 ${isPlaying ? 'scale-110' : 'scale-100'}`} size={64} />
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="text-xs text-red-500 text-center mb-2 px-2 bg-red-50 py-1 rounded">
                                {error}
                            </div>
                        )}

                        {/* Time Display */}
                        <div className="w-full flex justify-between text-sm font-mono text-slate-400 mb-2">
                            <span>{formatTime(currentTime)}</span>
                            <span>{podcast.duration || formatTime(duration)}</span>
                        </div>

                        {/* Progress Bar */}
                        <div
                            className="w-full h-2 bg-slate-100 rounded-full mb-8 cursor-pointer relative group"
                            ref={progressBarRef}
                            onClick={handleSeek}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-100 group-hover:bg-indigo-600"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center gap-6 mb-8">
                            <button
                                onClick={skipBackward}
                                disabled={!!error}
                                className="text-slate-400 hover:text-indigo-500 transition-colors p-2 hover:bg-slate-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Rewind 10s"
                            >
                                <RotateCcw size={22} />
                            </button>

                            <button
                                onClick={togglePlay}
                                disabled={!!error}
                                className="w-16 h-16 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                            </button>

                            <button
                                onClick={() => setShowSettings(!showSettings)}
                                disabled={!!error}
                                className={`text-slate-400 hover:text-indigo-500 transition-colors p-2 hover:bg-slate-50 rounded-full ${showSettings ? 'bg-slate-100 text-indigo-500' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <Settings2 size={22} />
                            </button>
                        </div>

                        {/* Settings Overlay (Conditional) */}
                        {showSettings && (
                            <div className="absolute bottom-20 left-4 right-4 bg-white/95 backdrop-blur-sm border border-slate-200 shadow-lg rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 z-20">
                                <div className="space-y-4">
                                    {/* Speed Control */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-semibold uppercase text-slate-400">Speed</span>
                                        <button
                                            onClick={changeSpeed}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            {playbackRate}x
                                        </button>
                                    </div>

                                    {/* Volume Control */}
                                    <div className="flex justify-between items-center gap-3">
                                        <button onClick={toggleMute} className="text-slate-400 hover:text-slate-600">
                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <input
                                            type="range"
                                            min="0" max="1" step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value);
                                                setVolume(val);
                                                if (audioRef.current) audioRef.current.volume = val;
                                                setIsMuted(val === 0);
                                            }}
                                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Switching Buttons */}
                        <div className="mt-auto flex gap-4 w-full">
                            <button
                                onClick={() => setActiveTab('transcript')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${activeTab === 'transcript'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                    : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border-slate-100'
                                    }`}
                            >
                                TRANSCRIPT
                            </button>
                            <button
                                onClick={() => setActiveTab('quiz')}
                                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all border ${activeTab === 'quiz'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105'
                                    : 'text-slate-500 bg-slate-50 hover:bg-slate-100 border-slate-100'
                                    }`}
                            >
                                QUIZ
                            </button>
                        </div>
                    </div>
                </section>

                {/* --- Right Col: Content Area (Transcript or Quiz) --- */}
                <section className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 min-h-[60px]">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            {activeTab === 'transcript' ? (
                                <>
                                    <Clock size={16} className="text-indigo-500" />
                                    Transcript
                                </>
                            ) : (
                                <>
                                    <BookOpen size={16} className="text-indigo-500" />
                                    Quiz Questions
                                </>
                            )}
                        </h3>
                        {activeTab === 'transcript' && (
                            <button className="text-slate-400 hover:text-slate-600" title="Download Transcript">
                                <Download size={18} />
                            </button>
                        )}
                        {activeTab === 'quiz' && showQuizResults && quizScore && (
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-bold ${quizScore.correct === quizScore.total ? 'text-emerald-600' : 'text-indigo-600'}`}>
                                    {quizScore.correct}/{quizScore.total} correct
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
                        {activeTab === 'transcript' ? (
                            <>
                                {podcast.transcript?.map((segment, index) => (
                                    <TranscriptSegment
                                        key={index}
                                        segment={segment}
                                        index={index}
                                        isActive={index === activeTranscriptIndex}
                                        onClick={() => handleTranscriptClick(segment)}
                                    />
                                ))}
                                <div className="h-20 flex items-center justify-center text-slate-300 text-sm italic">
                                    End of Transcript
                                </div>
                            </>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {podcast.quiz?.map((question, index) => (
                                    <QuizQuestion
                                        key={index}
                                        question={question}
                                        index={index}
                                        selectedAnswer={quizAnswers[index]}
                                        onSelectAnswer={(answer) => handleSelectAnswer(index, answer)}
                                        showResult={showQuizResults}
                                    />
                                ))}

                                {/* Quiz Actions */}
                                <div className="mt-6 flex justify-center gap-4">
                                    {!showQuizResults ? (
                                        <button
                                            onClick={handleSubmitQuiz}
                                            disabled={Object.keys(quizAnswers).length < (podcast.quiz?.length || 0)}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Submit Answers
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleResetQuiz}
                                            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    )}
                                </div>

                                {/* Results Summary */}
                                {showQuizResults && quizScore && (
                                    <div className={`mt-6 p-6 rounded-xl text-center ${quizScore.correct === quizScore.total
                                        ? 'bg-emerald-50 border border-emerald-200'
                                        : 'bg-indigo-50 border border-indigo-200'
                                        }`}>
                                        <h4 className={`text-lg font-bold mb-2 ${quizScore.correct === quizScore.total ? 'text-emerald-700' : 'text-indigo-700'
                                            }`}>
                                            {quizScore.correct === quizScore.total
                                                ? 'Perfekt! Ausgezeichnet!'
                                                : `${quizScore.correct} von ${quizScore.total} richtig`}
                                        </h4>
                                        <p className="text-sm text-slate-600">
                                            {quizScore.correct === quizScore.total
                                                ? 'You answered all questions correctly!'
                                                : 'Review the highlighted answers and try again.'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

            </main>

            {/* Words Used Section */}
            {podcast.words && podcast.words.length > 0 && (
                <div className="w-full max-w-3xl mt-8">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Words Practiced</h3>
                    <div className="flex flex-wrap gap-2">
                        {podcast.words.map((word, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700"
                            >
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-12 text-center text-slate-400 text-sm max-w-md">
                {activeTab === 'transcript' ? (
                    <p>Pro Tip: Listen to the audio while following the <span className="text-indigo-500 font-semibold">transcript</span> to improve comprehension.</p>
                ) : (
                    <p>Pro Tip: Answer all questions before submitting to see your <span className="text-indigo-500 font-semibold">complete score</span>.</p>
                )}
            </div>
        </div>
    );
}
