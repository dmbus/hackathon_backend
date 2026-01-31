import {
    AlertCircle,
    ArrowLeft,
    Check,
    ChevronDown,
    Loader2,
    Mic,
    Plus,
    Sparkles,
    Volume2,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPodcast, getContexts, getVoices } from '../services/podcastService';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Level badge styles
const levelStyles = {
    A1: "bg-emerald-50 text-emerald-700 border-emerald-200",
    A2: "bg-teal-50 text-teal-700 border-teal-200",
    B1: "bg-blue-50 text-blue-700 border-blue-200",
    B2: "bg-indigo-50 text-indigo-700 border-indigo-200",
    C1: "bg-violet-50 text-violet-700 border-violet-200",
    C2: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function CreatePodcastPage() {
    const navigate = useNavigate();

    // Form state
    const [words, setWords] = useState([]);
    const [wordInput, setWordInput] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('B1');
    const [selectedContext, setSelectedContext] = useState('');
    const [selectedVoices, setSelectedVoices] = useState([]);

    // Data from API
    const [contexts, setContexts] = useState([]);
    const [voices, setVoices] = useState([]);

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [contextDropdownOpen, setContextDropdownOpen] = useState(false);
    const [voiceDropdownOpen, setVoiceDropdownOpen] = useState(false);

    // Fetch contexts and voices on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [contextsData, voicesData] = await Promise.all([
                    getContexts(),
                    getVoices()
                ]);
                setContexts(contextsData);
                setVoices(voicesData);
                if (contextsData.length > 0) {
                    setSelectedContext(contextsData[0]);
                }
                // Pre-select first two voices
                if (voicesData.length >= 2) {
                    setSelectedVoices([voicesData[0].voice_id, voicesData[1].voice_id]);
                } else if (voicesData.length === 1) {
                    setSelectedVoices([voicesData[0].voice_id]);
                }
            } catch (err) {
                setError('Failed to load configuration. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Handle adding a word
    const handleAddWord = (e) => {
        e.preventDefault();
        const trimmedWord = wordInput.trim();
        if (trimmedWord && words.length < 7 && !words.includes(trimmedWord)) {
            setWords([...words, trimmedWord]);
            setWordInput('');
        }
    };

    // Handle removing a word
    const handleRemoveWord = (wordToRemove) => {
        setWords(words.filter(w => w !== wordToRemove));
    };

    // Handle voice selection
    const toggleVoice = (voiceId) => {
        if (selectedVoices.includes(voiceId)) {
            setSelectedVoices(selectedVoices.filter(v => v !== voiceId));
        } else if (selectedVoices.length < 2) {
            setSelectedVoices([...selectedVoices, voiceId]);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (words.length < 3) {
            setError('Please add at least 3 words');
            return;
        }
        if (!selectedContext) {
            setError('Please select a context');
            return;
        }
        if (selectedVoices.length === 0) {
            setError('Please select at least one voice');
            return;
        }

        setError(null);
        setIsGenerating(true);

        try {
            const podcast = await createPodcast({
                words,
                cefr_level: selectedLevel,
                context: selectedContext,
                voice_ids: selectedVoices
            });

            // Navigate to the new podcast
            navigate(`/learning/listening/${podcast.id}`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to generate podcast. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    // Form validation
    const isFormValid = words.length >= 3 && words.length <= 7 && selectedContext && selectedVoices.length > 0;

    // Debug logging
    console.log('Form state:', {
        wordsCount: words.length,
        selectedContext,
        selectedVoicesCount: selectedVoices.length,
        isFormValid,
        contexts: contexts.length,
        voices: voices.length
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="font-sans text-slate-900 max-w-3xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/learning/listening')}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span className="text-sm font-medium">Back to Library</span>
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                    <div>
                        <p className="text-red-700 font-medium">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Form Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 space-y-6">

                    {/* Words Input */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            German Words <span className="text-slate-400 font-normal">(3-7 words)</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Enter the vocabulary words you want to practice in the podcast.
                        </p>

                        {/* Word Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {words.map((word, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200"
                                >
                                    {word}
                                    <button
                                        onClick={() => handleRemoveWord(word)}
                                        className="hover:text-indigo-900 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>

                        {/* Word Input */}
                        <form onSubmit={handleAddWord} className="flex gap-2">
                            <input
                                type="text"
                                value={wordInput}
                                onChange={(e) => setWordInput(e.target.value)}
                                placeholder="Enter a German word..."
                                disabled={words.length >= 7}
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!wordInput.trim() || words.length >= 7}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </form>
                        <p className="text-xs text-slate-400 mt-2">
                            {words.length}/7 words added {words.length < 3 && `(minimum 3)`}
                        </p>
                    </div>

                    {/* CEFR Level */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            CEFR Level
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Select the language difficulty level for the podcast.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {CEFR_LEVELS.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(level)}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-bold transition-all border
                                        ${selectedLevel === level
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : `${levelStyles[level]} hover:shadow-sm`
                                        }
                                    `}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Context Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Context / Setting
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Choose the scenario for the dialogue.
                        </p>
                        <div className="relative">
                            <button
                                onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-slate-300 transition-colors"
                            >
                                <span className={selectedContext ? 'text-slate-700' : 'text-slate-400'}>
                                    {selectedContext || 'Select a context...'}
                                </span>
                                <ChevronDown
                                    size={18}
                                    className={`text-slate-400 transition-transform ${contextDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {contextDropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {contexts.map((context) => (
                                        <button
                                            key={context}
                                            onClick={() => {
                                                setSelectedContext(context);
                                                setContextDropdownOpen(false);
                                            }}
                                            className={`
                                                w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between
                                                ${selectedContext === context ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}
                                            `}
                                        >
                                            {context}
                                            {selectedContext === context && <Check size={16} className="text-indigo-600" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Voices <span className="text-slate-400 font-normal">(1-2 speakers)</span>
                        </label>
                        <p className="text-xs text-slate-500 mb-3">
                            Select the AI voices for the podcast speakers.
                        </p>
                        <div className="relative">
                            <button
                                onClick={() => setVoiceDropdownOpen(!voiceDropdownOpen)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-slate-300 transition-colors"
                            >
                                <span className={selectedVoices.length > 0 ? 'text-slate-700' : 'text-slate-400'}>
                                    {selectedVoices.length > 0
                                        ? `${selectedVoices.length} voice(s) selected`
                                        : 'Select voices...'}
                                </span>
                                <ChevronDown
                                    size={18}
                                    className={`text-slate-400 transition-transform ${voiceDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </button>
                            {voiceDropdownOpen && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {voices.map((voice) => (
                                        <button
                                            key={voice.voice_id}
                                            onClick={() => toggleVoice(voice.voice_id)}
                                            disabled={!selectedVoices.includes(voice.voice_id) && selectedVoices.length >= 2}
                                            className={`
                                                w-full px-4 py-2.5 text-sm text-left hover:bg-slate-50 flex items-center justify-between
                                                ${selectedVoices.includes(voice.voice_id) ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}
                                                ${!selectedVoices.includes(voice.voice_id) && selectedVoices.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Mic size={14} className="text-slate-400" />
                                                <span>{voice.name}</span>
                                                {voice.labels?.accent && (
                                                    <span className="text-xs text-slate-400">({voice.labels.accent})</span>
                                                )}
                                            </div>
                                            {selectedVoices.includes(voice.voice_id) && (
                                                <Check size={16} className="text-indigo-600" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected voices preview */}
                        {selectedVoices.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedVoices.map((voiceId) => {
                                    const voice = voices.find(v => v.voice_id === voiceId);
                                    return voice ? (
                                        <span
                                            key={voiceId}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                                        >
                                            <Volume2 size={14} />
                                            {voice.name}
                                            <button
                                                onClick={() => toggleVoice(voiceId)}
                                                className="hover:text-slate-900 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                        {words.length < 3 && <p className="text-amber-600">Add at least {3 - words.length} more word(s)</p>}
                        {words.length >= 3 && !selectedContext && <p className="text-amber-600">Select a context</p>}
                        {words.length >= 3 && selectedContext && selectedVoices.length === 0 && <p className="text-amber-600">Select at least one voice</p>}
                        {isFormValid && <p>Ready to generate!</p>}
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isGenerating}
                        className={`
                            px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                            ${isFormValid && !isGenerating
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Generate Podcast
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Generation Progress Overlay */}
            {isGenerating && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Loader2 size={32} className="animate-spin text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Generating Your Podcast</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            Our AI is creating your personalized German learning podcast with script, audio, and quiz questions.
                        </p>
                        <div className="space-y-2 text-xs text-slate-400">
                            <p>• Generating dialogue script...</p>
                            <p>• Creating audio with ElevenLabs...</p>
                            <p>• Preparing quiz questions...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
