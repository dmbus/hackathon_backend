import {
    ArrowLeft,
    CheckCircle,
    ChevronRight,
    Info,
    Loader2,
    Play,
    RefreshCw,
    Target,
    Volume2,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pronunciationService } from '../services/pronunciationService';

// --- Helper Components ---

const DifficultyBadge = ({ level }) => {
    const styles = {
        beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
        intermediate: "bg-amber-50 text-amber-700 border-amber-200",
        advanced: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[level] || styles.intermediate}`}>
            {level}
        </span>
    );
};

const ExerciseCard = ({ exercise, index, onClick, completed = false }) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer group ${
            completed ? 'border-emerald-200' : 'border-slate-200 hover:border-indigo-200'
        }`}
    >
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                    completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                } transition-colors`}>
                    {completed ? <CheckCircle size={20} /> : index + 1}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {exercise.word}
                    </h4>
                    <p className="text-sm text-slate-500 font-mono">{exercise.ipa}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400 max-w-[200px] truncate hidden md:block">
                    {exercise.sentence}
                </span>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" size={20} />
            </div>
        </div>
    </div>
);

// --- Main Component ---

export default function PronunciationModulePage() {
    const navigate = useNavigate();
    const { soundId } = useParams();

    // State
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch module on mount
    useEffect(() => {
        if (soundId) {
            fetchModule();
        }
    }, [soundId]);

    const fetchModule = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await pronunciationService.getModule(soundId);
            setModule(data);
        } catch (err) {
            console.error('Failed to fetch pronunciation module:', err);
            setError(err.message || 'Failed to load module.');
        } finally {
            setLoading(false);
        }
    };

    const handlePractice = (exerciseIndex) => {
        navigate(`/learning/pronunciation/${soundId}/practice`, {
            state: { exerciseIndex }
        });
    };

    const renderLoading = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading module...</p>
        </div>
    );

    const renderError = () => (
        <div className="py-20 flex flex-col items-center justify-center">
            <div className="bg-rose-100 p-4 rounded-full mb-4">
                <XCircle size={48} className="text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Failed to load module</h3>
            <p className="text-slate-500 text-center max-w-md mb-6">{error}</p>
            <div className="flex gap-3">
                <button
                    onClick={() => navigate('/learning/pronunciation')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold border border-slate-200 hover:bg-slate-50 transition-all"
                >
                    <ArrowLeft size={18} />
                    Go Back
                </button>
                <button
                    onClick={fetchModule}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-indigo-700 transition-all"
                >
                    <RefreshCw size={18} />
                    Try Again
                </button>
            </div>
        </div>
    );

    if (loading) return renderLoading();
    if (error) return renderError();
    if (!module) return null;

    const progress = module.user_progress;
    const avgScore = progress?.average_score || 0;
    const totalAttempts = progress?.total_attempts || 0;

    return (
        <div className="font-sans text-slate-600">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/learning/pronunciation')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    <span className="font-medium">Back to Modules</span>
                </button>

                {/* Module Header */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div className="flex items-start gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-mono font-bold text-2xl flex-shrink-0">
                                {module.phoneme_ipa}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800 mb-1">{module.name}</h1>
                                <div className="flex items-center gap-3">
                                    <DifficultyBadge level={module.difficulty_level} />
                                    <span className="text-sm text-slate-500">
                                        {module.exercises?.length || 0} exercises
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => handlePractice(0)}
                            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                            <Play size={18} fill="currentColor" />
                            Start Practice
                        </button>
                    </div>

                    <p className="text-slate-600 mb-4">{module.description}</p>

                    {/* Articulatory Tip */}
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                <Info size={16} className="text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-indigo-800 mb-1">How to pronounce</h4>
                                <p className="text-sm text-indigo-700">{module.articulatory_tip}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Card (if practiced) */}
                {totalAttempts > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target size={18} className="text-indigo-500" />
                            Your Progress
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <div className="text-2xl font-bold text-indigo-600">{Math.round(avgScore)}%</div>
                                <div className="text-xs text-slate-500 mt-1">Average Score</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <div className="text-2xl font-bold text-slate-800">{totalAttempts}</div>
                                <div className="text-xs text-slate-500 mt-1">Total Attempts</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {Math.round(progress?.best_score || 0)}%
                                </div>
                                <div className="text-xs text-slate-500 mt-1">Best Score</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Exercise List */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Volume2 size={18} className="text-indigo-500" />
                        Exercises
                    </h3>

                    <div className="space-y-3">
                        {module.exercises?.map((exercise, index) => (
                            <ExerciseCard
                                key={index}
                                exercise={exercise}
                                index={index}
                                onClick={() => handlePractice(index)}
                            />
                        ))}
                    </div>

                    {(!module.exercises || module.exercises.length === 0) && (
                        <div className="py-12 text-center text-slate-400">
                            <Volume2 size={32} className="mx-auto mb-3 opacity-30" />
                            <p>No exercises available for this module.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
