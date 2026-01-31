import {
    AlertCircle,
    Award,
    BarChart3,
    BookOpen,
    CheckCircle2,
    ChevronRight,
    Mic,
    RefreshCw,
    Square,
    Volume2,
    Zap,
    XCircle,
    Loader2,
    GraduationCap
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakingService } from '../services/speakingService';

// --- Helper Components ---

const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = '', disabled = false }) => {
    const baseStyles = "flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 py-4 shadow-lg shadow-indigo-200",
        secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-full px-6 py-3 shadow-sm hover:shadow-md",
        icon: "p-4 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm hover:scale-110 hover:text-indigo-600 hover:shadow-md",
        danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-full px-6 py-3"
    };

    return (
        <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${className}`}>
            {Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

const ProgressBar = ({ label, value, colorClass = "bg-indigo-500" }) => (
    <div className="mb-4">
        <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
            <span className="font-mono text-sm font-bold text-slate-700">{value}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                style={{ width: `${value}%` }}
            />
        </div>
    </div>
);

const Badge = ({ children, type = 'neutral' }) => {
    const colors = {
        neutral: "bg-slate-100 text-slate-600",
        indigo: "bg-indigo-50 text-indigo-600",
        rose: "bg-rose-50 text-rose-600",
        emerald: "bg-emerald-50 text-emerald-600"
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colors[type]}`}>
            {children}
        </span>
    );
};

// --- Main Component ---

// CEFR Level descriptions
const LEVEL_INFO = {
    A1: { name: 'Beginner', description: 'Basic phrases and introductions', color: 'emerald' },
    A2: { name: 'Elementary', description: 'Daily situations and past tense', color: 'teal' },
    B1: { name: 'Intermediate', description: 'Opinions and experiences', color: 'blue' },
    B2: { name: 'Upper Intermediate', description: 'Abstract topics and debates', color: 'indigo' },
    C1: { name: 'Advanced', description: 'Complex social issues', color: 'violet' },
    C2: { name: 'Mastery', description: 'Philosophy and nuanced debates', color: 'purple' }
};

export default function SpeakingPage() {
    const navigate = useNavigate();
    
    // State
    const [status, setStatus] = useState('select-level'); // select-level, loading, idle, recording, processing, feedback, error
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [bars, setBars] = useState(Array(12).fill(10));
    const [error, setError] = useState(null);
    
    // Practice session data
    const [practiceData, setPracticeData] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    
    // Audio recording refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const fetchPracticeSession = async (level) => {
        setStatus('loading');
        setError(null);
        try {
            const data = await speakingService.getPracticeSession({ level });
            setPracticeData(data);
            setStatus('idle');
        } catch (err) {
            console.error('Failed to fetch practice session:', err);
            setError(err.message || 'Failed to load practice session. Please try again.');
            setStatus('error');
        }
    };

    const handleLevelSelect = (level) => {
        setSelectedLevel(level);
        fetchPracticeSession(level);
    };

    // Timer Logic
    useEffect(() => {
        let interval;
        if (status === 'recording' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finishRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, timeLeft]);

    // Real-time audio visualization using Web Audio API
    const updateVisualization = useCallback(() => {
        if (analyserRef.current && status === 'recording') {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Sample 12 values from the frequency data
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
            updateVisualization();
        }
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [status, updateVisualization]);

    const startRecording = async () => {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });
            streamRef.current = stream;

            // Set up Web Audio API for visualization
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = analyser;

            // Set up MediaRecorder
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
                ? 'audio/webm;codecs=opus' 
                : 'audio/mp4';
            
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
                
                // Create blob from chunks
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
                
                // Submit for analysis
                await submitRecording(audioBlob);
            };

            // Start recording
            mediaRecorder.start(1000); // Collect data every second
            setStatus('recording');
            setTimeLeft(60);
            setError(null);

        } catch (err) {
            console.error('Failed to start recording:', err);
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please allow microphone access and try again.');
            } else {
                setError('Failed to start recording. Please check your microphone.');
            }
        }
    };

    const finishRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            setStatus('processing');
            mediaRecorderRef.current.stop();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setStatus('idle');
        setTimeLeft(60);
        audioChunksRef.current = [];
    };

    const submitRecording = async (audioBlob) => {
        try {
            const result = await speakingService.submitRecording(
                audioBlob,
                practiceData.question.text,
                practiceData.targetWords
            );
            setAnalysisResult(result);
            setStatus('feedback');
        } catch (err) {
            console.error('Failed to analyze recording:', err);
            setError(err.message || 'Failed to analyze your recording. Please try again.');
            setStatus('error');
        }
    };

    const reset = () => {
        setAnalysisResult(null);
        setTimeLeft(60);
        setError(null);
        if (selectedLevel) {
            setStatus('loading');
            fetchPracticeSession(selectedLevel);
        } else {
            setStatus('select-level');
        }
    };

    const changeLevel = () => {
        setStatus('select-level');
        setSelectedLevel(null);
        setPracticeData(null);
        setAnalysisResult(null);
        setTimeLeft(60);
        setError(null);
    };

    // --- Render Stages ---

    const renderLevelSelector = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
                    <GraduationCap size={32} className="text-indigo-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
                    Choose Your Level
                </h1>
                <p className="text-slate-500 max-w-md mx-auto">
                    Select your CEFR level to get questions matched to your proficiency
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {Object.entries(LEVEL_INFO).map(([level, info]) => (
                    <button
                        key={level}
                        onClick={() => handleLevelSelect(level)}
                        className={`group relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg
                            ${selectedLevel === level 
                                ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                                : 'border-slate-200 bg-white hover:border-indigo-300'
                            }`}
                    >
                        <div className={`text-2xl font-extrabold mb-1 ${
                            selectedLevel === level ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-600'
                        }`}>
                            {level}
                        </div>
                        <div className="text-sm font-semibold text-slate-600 mb-1">
                            {info.name}
                        </div>
                        <div className="text-xs text-slate-400">
                            {info.description}
                        </div>
                    </button>
                ))}
            </div>

            <div className="text-center">
                <button 
                    onClick={() => navigate('/learning/speaking')} 
                    className="text-slate-400 hover:text-indigo-600 text-sm font-semibold transition-colors"
                >
                    <ChevronRight size={16} className="inline rotate-180" /> Back to History
                </button>
            </div>
        </div>
    );

    const renderHeader = () => (
        <div className="flex justify-between items-start mb-8">
            <div>
                <button onClick={() => navigate('/learning/speaking')} className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 mb-2 transition-colors text-sm font-semibold">
                    <ChevronRight size={16} className="rotate-180" /> Back to History
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <Badge type="indigo">Speaking Practice</Badge>
                    {selectedLevel && (
                        <>
                            <span className="text-slate-400 text-sm font-semibold">•</span>
                            <button 
                                onClick={changeLevel}
                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors text-xs font-bold"
                            >
                                {selectedLevel} - {LEVEL_INFO[selectedLevel]?.name}
                                <ChevronRight size={12} className="rotate-90" />
                            </button>
                        </>
                    )}
                    <span className="text-slate-400 text-sm font-semibold">•</span>
                    <span className="text-slate-400 text-sm font-medium">Max 60 seconds</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800">
                    Speaking Practice
                </h1>
            </div>
            <div className="hidden md:block">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Volume2 size={20} />
                </div>
            </div>
        </div>
    );

    const renderLoading = () => (
        <div className="py-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Practice Session</h3>
            <p className="text-slate-500">Preparing your question and vocabulary...</p>
        </div>
    );

    const renderError = () => (
        <div className="py-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="bg-rose-100 p-4 rounded-full mb-4">
                <XCircle size={48} className="text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">{error}</p>
            <Button onClick={reset} icon={RefreshCw}>Try Again</Button>
        </div>
    );

    const renderIdle = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 rounded-xl p-8 mb-8 border border-slate-100">
                {practiceData?.question?.theme && (
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">
                            {practiceData.question.theme}
                        </span>
                    </div>
                )}
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                    Your Question
                </h2>
                <p className="text-2xl md:text-3xl font-medium text-slate-700 leading-relaxed mb-4">
                    "{practiceData?.question?.text}"
                </p>
                {practiceData?.question?.text_en && (
                    <p className="text-sm text-slate-400 italic">
                        {practiceData.question.text_en}
                    </p>
                )}
            </div>

            <div className="space-y-4 mb-10">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Zap size={16} className="text-indigo-500" />
                    Target Words to Use
                </h3>
                <div className="flex flex-wrap gap-3">
                    {practiceData?.targetWords?.map((word, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-lg px-4 py-3 shadow-sm">
                            <div className="font-bold text-slate-800">{word.word}</div>
                            <div className="text-sm text-slate-500">{word.translation}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-amber-800 font-medium">Recording Tips</p>
                        <p className="text-sm text-amber-700 mt-1">
                            Try to use all the target words naturally in your answer. 
                            You have 60 seconds maximum. Speak clearly and at a natural pace.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center">
                <Button onClick={startRecording} icon={Mic} className="w-full md:w-auto min-w-[200px]">
                    Start Recording
                </Button>
            </div>
        </div>
    );

    const renderRecording = () => (
        <div className="text-center py-8 animate-in zoom-in-95 duration-300">
            <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-6 rounded-full shadow-xl border border-indigo-50">
                    <Mic size={48} className="text-indigo-600" />
                </div>
            </div>

            <h2 className="text-slate-400 font-semibold uppercase tracking-wider text-sm mb-2">Recording</h2>
            <div className="text-5xl font-mono font-bold text-slate-800 mb-8 tabular-nums">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>

            {/* Audio Visualizer */}
            <div className="h-16 flex items-center justify-center gap-1 mb-10">
                {bars.map((height, i) => (
                    <div
                        key={i}
                        className="w-2 bg-indigo-400 rounded-full transition-all duration-100"
                        style={{ height: `${height}px`, opacity: 0.5 + (height / 120) }}
                    ></div>
                ))}
            </div>

            <div className="flex justify-center gap-4">
                <Button variant="danger" onClick={cancelRecording}>Cancel</Button>
                <Button variant="primary" onClick={finishRecording} icon={Square}>Stop & Submit</Button>
            </div>
        </div>
    );

    const renderProcessing = () => (
        <div className="py-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative w-20 h-20 mb-8">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Speech</h3>
            <p className="text-slate-500">Transcribing and checking grammar, vocabulary, and usage...</p>
        </div>
    );

    const renderFeedback = () => {
        if (!analysisResult) return null;
        
        const { analysis, targetWords } = analysisResult;
        
        // Calculate metrics from word usage
        const wordsUsed = analysis.wordUsage?.filter(w => w.isUsed).length || 0;
        const wordsCorrect = analysis.wordUsage?.filter(w => w.isUsedCorrectly).length || 0;
        const wordUsageScore = targetWords?.length > 0 ? Math.round((wordsCorrect / targetWords.length) * 100) : 0;
        
        return (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
                {/* Score Header */}
                <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-indigo-200">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20 flex items-center justify-center bg-indigo-500 rounded-full ring-4 ring-indigo-400/30">
                                <span className="text-3xl font-extrabold tracking-tight">{analysis.score}</span>
                            </div>
                            <div>
                                <h2 className="text-indigo-100 text-sm font-semibold uppercase tracking-wider mb-1">Overall Score</h2>
                                <p className="text-2xl font-bold">
                                    {analysis.score >= 80 ? 'Excellent!' : analysis.score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
                                </p>
                                <Badge type="neutral">{analysis.cefrLevel}</Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Word Usage Analysis */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        <BookOpen size={16} /> Target Word Usage ({wordsCorrect}/{targetWords?.length || 0} correct)
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analysis.wordUsage?.map((wordAnalysis, idx) => (
                            <div 
                                key={idx} 
                                className={`bg-white border rounded-xl p-4 shadow-sm ${
                                    wordAnalysis.isUsedCorrectly 
                                        ? 'border-emerald-200 bg-emerald-50/30' 
                                        : wordAnalysis.isUsed 
                                            ? 'border-amber-200 bg-amber-50/30'
                                            : 'border-rose-200 bg-rose-50/30'
                                }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <span className="font-bold text-slate-800">{wordAnalysis.word}</span>
                                    {wordAnalysis.isUsedCorrectly ? (
                                        <CheckCircle2 size={20} className="text-emerald-500" />
                                    ) : wordAnalysis.isUsed ? (
                                        <AlertCircle size={20} className="text-amber-500" />
                                    ) : (
                                        <XCircle size={20} className="text-rose-500" />
                                    )}
                                </div>
                                <p className="text-sm text-slate-600">{wordAnalysis.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Transcription and Correction */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <Volume2 size={16} /> Your Transcription
                        </h3>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <p className="text-slate-700 leading-relaxed">{analysis.transcription}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Corrected Version
                        </h3>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <p className="text-slate-700 leading-relaxed">{analysis.correctedText}</p>
                        </div>
                    </div>
                </div>

                {/* General Feedback */}
                <div className="mb-10">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <Award size={16} /> Feedback & Suggestions
                    </h3>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                        <p className="text-slate-700 leading-relaxed">{analysis.generalFeedback}</p>
                    </div>
                </div>

                {/* Metrics Summary */}
                <div className="mb-10">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                        <BarChart3 size={16} /> Performance Summary
                    </h3>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <ProgressBar label="Overall Score" value={analysis.score} colorClass="bg-indigo-500" />
                        <ProgressBar label="Target Word Usage" value={wordUsageScore} colorClass="bg-emerald-500" />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap justify-center gap-4 py-4 border-t border-slate-100">
                    <Button variant="secondary" onClick={reset} icon={RefreshCw}>Try Another ({selectedLevel})</Button>
                    <Button variant="secondary" onClick={changeLevel} icon={GraduationCap}>Change Level</Button>
                    <Button variant="primary" onClick={() => navigate('/learning/speaking')} icon={ChevronRight}>View History</Button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative transition-all duration-500">
            {/* Progress Bar (Top) */}
            {status !== 'feedback' && status !== 'error' && status !== 'select-level' && (
                <div className="h-1 bg-slate-100 w-full">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{
                            width: status === 'loading' ? '10%' : 
                                   status === 'idle' ? '25%' : 
                                   status === 'recording' ? '50%' : '75%'
                        }}
                    />
                </div>
            )}

            <div className="p-6 md:p-10">
                {status !== 'feedback' && status !== 'loading' && status !== 'error' && status !== 'select-level' && renderHeader()}

                <div className="min-h-[400px]">
                    {status === 'select-level' && renderLevelSelector()}
                    {status === 'loading' && renderLoading()}
                    {status === 'error' && renderError()}
                    {status === 'idle' && practiceData && renderIdle()}
                    {status === 'recording' && renderRecording()}
                    {status === 'processing' && renderProcessing()}
                    {status === 'feedback' && renderFeedback()}
                </div>
            </div>
        </div>
    );
}
