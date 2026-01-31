import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Info,
    Loader2,
    Mic,
    Pause,
    Play,
    RefreshCw,
    Square,
    Volume2,
    XCircle
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { pronunciationService } from '../services/pronunciationService';

// --- Helper Components ---

const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '', disabled = false }) => {
    const baseStyles = "flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 shadow-lg shadow-indigo-200",
        secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-full px-6 py-3 shadow-sm hover:shadow-md",
        icon: "p-4 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:scale-110 hover:text-indigo-600 hover:shadow-md",
        danger: "bg-rose-600 hover:bg-rose-700 text-white rounded-full px-8 py-4 shadow-lg shadow-rose-200"
    };

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

const ScoreRing = ({ score, size = 'large' }) => {
    const sizeStyles = {
        large: "w-32 h-32 text-4xl",
        medium: "w-20 h-20 text-2xl",
        small: "w-12 h-12 text-lg"
    };

    const getColor = (s) => {
        if (s >= 90) return "text-emerald-500 border-emerald-300 bg-emerald-50";
        if (s >= 75) return "text-indigo-500 border-indigo-300 bg-indigo-50";
        if (s >= 60) return "text-amber-500 border-amber-300 bg-amber-50";
        return "text-rose-500 border-rose-300 bg-rose-50";
    };

    return (
        <div className={`rounded-full border-4 flex items-center justify-center font-bold ${sizeStyles[size]} ${getColor(score)}`}>
            {Math.round(score)}%
        </div>
    );
};

// --- Main Component ---

export default function PronunciationPracticePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { soundId } = useParams();

    // Get initial exercise index from navigation state
    const initialIndex = location.state?.exerciseIndex || 0;

    // State
    const [module, setModule] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [exercise, setExercise] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, ready, recording, processing, results, error
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(10);
    const [bars, setBars] = useState(Array(12).fill(10));

    // Audio refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);
    const benchmarkAudioRef = useRef(null);
    const [isPlayingBenchmark, setIsPlayingBenchmark] = useState(false);

    // Fetch module on mount
    useEffect(() => {
        fetchModule();
        return () => {
            cleanupRecording();
        };
    }, [soundId]);

    // Fetch exercise when index changes
    useEffect(() => {
        if (module) {
            fetchExercise();
        }
    }, [currentIndex, module]);

    const fetchModule = async () => {
        try {
            const data = await pronunciationService.getModule(soundId);
            setModule(data);
        } catch (err) {
            console.error('Failed to fetch module:', err);
            setError(err.message || 'Failed to load module');
            setStatus('error');
        }
    };

    const fetchExercise = async () => {
        setStatus('loading');
        setAnalysisResult(null);
        try {
            const data = await pronunciationService.getExercise(soundId, currentIndex);
            setExercise(data);
            setStatus('ready');
        } catch (err) {
            console.error('Failed to fetch exercise:', err);
            setError(err.message || 'Failed to load exercise');
            setStatus('error');
        }
    };

    // Timer logic
    useEffect(() => {
        let interval;
        if (status === 'recording' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    // Audio visualization
    const updateVisualization = useCallback(() => {
        if (analyserRef.current && status === 'recording') {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);

            const step = Math.floor(dataArray.length / 12);
            const newBars = Array(12).fill(0).map((_, i) => {
                const value = dataArray[i * step];
                return Math.max(10, Math.min(60, (value / 255) * 60));
            });
            setBars(newBars);
            animationFrameRef.current = requestAnimationFrame(updateVisualization);
        }
    }, [status]);

    useEffect(() => {
        if (status === 'recording') {
            animationFrameRef.current = requestAnimationFrame(updateVisualization);
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [status, updateVisualization]);

    const cleanupRecording = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Set up audio analysis
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            analyserRef.current = audioContext.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
            });

            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
                await analyzeRecording(audioBlob);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setTimeLeft(10);
            setStatus('recording');
        } catch (err) {
            console.error('Failed to start recording:', err);
            setError('Microphone access denied. Please allow microphone access and try again.');
            setStatus('error');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            cleanupRecording();
            setStatus('processing');
        }
    };

    const analyzeRecording = async (audioBlob) => {
        try {
            const result = await pronunciationService.analyzePronunciation(
                audioBlob,
                soundId,
                currentIndex
            );
            setAnalysisResult(result);
            setStatus('results');
        } catch (err) {
            console.error('Failed to analyze recording:', err);
            setError(err.message || 'Failed to analyze pronunciation');
            setStatus('error');
        }
    };

    const playBenchmark = () => {
        if (exercise?.benchmark_audio_url) {
            if (benchmarkAudioRef.current) {
                benchmarkAudioRef.current.pause();
            }
            benchmarkAudioRef.current = new Audio(exercise.benchmark_audio_url);
            benchmarkAudioRef.current.onplay = () => setIsPlayingBenchmark(true);
            benchmarkAudioRef.current.onended = () => setIsPlayingBenchmark(false);
            benchmarkAudioRef.current.onerror = () => setIsPlayingBenchmark(false);
            benchmarkAudioRef.current.play();
        }
    };

    const stopBenchmark = () => {
        if (benchmarkAudioRef.current) {
            benchmarkAudioRef.current.pause();
            benchmarkAudioRef.current.currentTime = 0;
            setIsPlayingBenchmark(false);
        }
    };

    const tryAgain = () => {
        setAnalysisResult(null);
        setStatus('ready');
        setBars(Array(12).fill(10));
    };

    const nextExercise = () => {
        if (module && currentIndex < module.exercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevExercise = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const renderLoading = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading exercise...</p>
        </div>
    );

    const renderError = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="bg-rose-100 p-4 rounded-full mb-4">
                <XCircle size={48} className="text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">{error}</p>
            <div className="flex gap-3">
                <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(`/learning/pronunciation/${soundId}`)}>
                    Back to Module
                </Button>
                <Button icon={RefreshCw} onClick={fetchExercise}>
                    Try Again
                </Button>
            </div>
        </div>
    );

    const renderReady = () => (
        <div className="text-center">
            {/* Word Display */}
            <div className="mb-8">
                <div className="inline-block bg-indigo-100 px-6 py-3 rounded-2xl mb-4">
                    <span className="text-3xl font-bold text-indigo-600">{exercise?.word}</span>
                </div>
                <p className="text-xl font-mono text-slate-500 mb-2">{exercise?.ipa}</p>
                <p className="text-slate-600 italic">"{exercise?.sentence}"</p>
            </div>

            {/* Benchmark Audio */}
            <div className="mb-8">
                <p className="text-sm text-slate-500 mb-3">Listen to the correct pronunciation:</p>
                <button
                    onClick={isPlayingBenchmark ? stopBenchmark : playBenchmark}
                    disabled={!exercise?.benchmark_audio_url}
                    className={`p-4 rounded-full transition-all ${
                        isPlayingBenchmark
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isPlayingBenchmark ? <Pause size={24} /> : <Volume2 size={24} />}
                </button>
                {!exercise?.benchmark_audio_url && (
                    <p className="text-xs text-slate-400 mt-2">Generating audio...</p>
                )}
            </div>

            {/* Articulatory Tip */}
            <div className="bg-amber-50 rounded-xl p-4 mb-8 max-w-lg mx-auto border border-amber-100">
                <div className="flex items-start gap-3">
                    <Info size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 text-left">{exercise?.articulatory_tip}</p>
                </div>
            </div>

            {/* Record Button */}
            <Button icon={Mic} onClick={startRecording}>
                Start Recording
            </Button>
        </div>
    );

    const renderRecording = () => (
        <div className="text-center">
            {/* Word Display */}
            <div className="mb-8">
                <div className="inline-block bg-rose-100 px-6 py-3 rounded-2xl mb-4">
                    <span className="text-3xl font-bold text-rose-600">{exercise?.word}</span>
                </div>
                <p className="text-xl font-mono text-slate-500">{exercise?.ipa}</p>
            </div>

            {/* Timer */}
            <div className="text-5xl font-mono font-bold text-rose-600 mb-6">
                0:{timeLeft.toString().padStart(2, '0')}
            </div>

            {/* Waveform */}
            <div className="flex items-end justify-center gap-1 h-16 mb-8">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className="w-3 bg-rose-400 rounded-full transition-all duration-75"
                        style={{ height: `${height}px` }}
                    />
                ))}
            </div>

            {/* Stop Button */}
            <Button variant="danger" icon={Square} onClick={stopRecording}>
                Stop Recording
            </Button>
        </div>
    );

    const renderProcessing = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Analyzing your pronunciation...</p>
        </div>
    );

    const renderResults = () => {
        const analysis = analysisResult?.analysis;
        if (!analysis) return null;

        return (
            <div className="max-w-2xl mx-auto">
                {/* Score */}
                <div className="text-center mb-8">
                    <ScoreRing score={analysis.overall_score} />
                    <p className="text-slate-500 mt-4">Pronunciation Score</p>
                </div>

                {/* IPA Comparison */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">IPA Comparison</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-xl">
                            <p className="text-xs text-emerald-600 font-semibold mb-1">Target</p>
                            <p className="font-mono text-lg text-emerald-800">{analysis.target_ipa}</p>
                        </div>
                        <div className="text-center p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-500 font-semibold mb-1">Your pronunciation</p>
                            <p className="font-mono text-lg text-slate-700">{analysis.user_ipa}</p>
                        </div>
                    </div>
                </div>

                {/* Phoneme Errors */}
                {analysis.phoneme_errors?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertCircle size={18} className="text-amber-500" />
                            Areas to Improve
                        </h3>
                        <div className="space-y-2">
                            {analysis.phoneme_errors.map((err, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                                    <span className="font-mono text-amber-800">
                                        Expected <strong>{err.target}</strong> but heard <strong>{err.produced}</strong>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Feedback */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-indigo-500" />
                        Feedback
                    </h3>
                    <p className="text-slate-600 mb-4">{analysis.ai_feedback}</p>

                    {analysis.articulatory_tips?.length > 0 && (
                        <div className="space-y-2">
                            {analysis.articulatory_tips.map((tip, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-500">
                                    <ChevronRight size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span>{tip}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <Button variant="secondary" icon={RefreshCw} onClick={tryAgain}>
                        Try Again
                    </Button>
                    {module && currentIndex < module.exercises.length - 1 && (
                        <Button icon={ArrowRight} onClick={nextExercise}>
                            Next Exercise
                        </Button>
                    )}
                </div>
            </div>
        );
    };

    if (status === 'loading') return renderLoading();
    if (status === 'error') return renderError();

    return (
        <div className="font-sans text-slate-600">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(`/learning/pronunciation/${soundId}`)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        <span className="font-medium">Back</span>
                    </button>

                    {module && (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={prevExercise}
                                disabled={currentIndex === 0}
                                className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm font-medium text-slate-500">
                                {currentIndex + 1} / {module.exercises?.length || 0}
                            </span>
                            <button
                                onClick={nextExercise}
                                disabled={!module || currentIndex >= module.exercises.length - 1}
                                className="p-2 rounded-full hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Module Info */}
                {module && (
                    <div className="bg-indigo-50 rounded-2xl p-4 mb-8 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-mono font-bold text-lg">
                            {module.phoneme_ipa}
                        </div>
                        <div>
                            <h2 className="font-bold text-indigo-800">{module.name}</h2>
                            <p className="text-sm text-indigo-600">Focus on the /{module.phoneme_ipa}/ sound</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                    {status === 'ready' && renderReady()}
                    {status === 'recording' && renderRecording()}
                    {status === 'processing' && renderProcessing()}
                    {status === 'results' && renderResults()}
                </div>
            </div>
        </div>
    );
}
