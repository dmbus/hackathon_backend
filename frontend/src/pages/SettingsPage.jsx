import {
    BookOpen,
    Check,
    ChevronDown,
    ClipboardCheck,
    GraduationCap,
    Loader2,
    RefreshCw,
    Save
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUserSettings, updateUserSettings } from '../services/userService';

const Card = ({ children, className = "", ...props }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`} {...props}>
        {children}
    </div>
);

const CEFR_LEVELS = [
    { value: 'A1', label: 'A1 - Beginner', description: 'Can understand basic phrases' },
    { value: 'A2', label: 'A2 - Elementary', description: 'Can communicate in simple tasks' },
    { value: 'B1', label: 'B1 - Intermediate', description: 'Can deal with most travel situations' },
    { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Can interact with fluency' },
    { value: 'C1', label: 'C1 - Advanced', description: 'Can express ideas fluently and spontaneously' },
    { value: 'C2', label: 'C2 - Proficient', description: 'Can understand virtually everything' },
];

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        flashcards_per_session: 30,
        word_repetitions: 3,
        questions_per_test: 20,
        cefr_level: 'B1'
    });
    const [originalSettings, setOriginalSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);
    const [cefrDropdownOpen, setCefrDropdownOpen] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await getUserSettings();
            setSettings(data);
            setOriginalSettings(data);
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaved(false);
            const updated = await updateUserSettings(settings);
            setSettings(updated);
            setOriginalSettings(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError('Failed to save settings');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

    const handleNumberChange = (field, value, min, max) => {
        const num = parseInt(value) || min;
        setSettings(prev => ({
            ...prev,
            [field]: Math.min(max, Math.max(min, num))
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                        hasChanges
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {saving ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : saved ? (
                        <Check size={18} />
                    ) : (
                        <Save size={18} />
                    )}
                    {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                </div>
            )}

            {/* CEFR Level */}
            <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <GraduationCap className="text-purple-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Language Level</h3>
                        <p className="text-slate-500 text-sm">Set your current CEFR level for personalized content</p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setCefrDropdownOpen(!cefrDropdownOpen)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                        <div className="text-left">
                            <p className="font-semibold text-slate-900">
                                {CEFR_LEVELS.find(l => l.value === settings.cefr_level)?.label}
                            </p>
                            <p className="text-sm text-slate-500">
                                {CEFR_LEVELS.find(l => l.value === settings.cefr_level)?.description}
                            </p>
                        </div>
                        <ChevronDown size={20} className={`text-slate-400 transition-transform ${cefrDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {cefrDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                            {CEFR_LEVELS.map((level) => (
                                <button
                                    key={level.value}
                                    onClick={() => {
                                        setSettings(prev => ({ ...prev, cefr_level: level.value }));
                                        setCefrDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left ${
                                        settings.cefr_level === level.value ? 'bg-indigo-50' : ''
                                    }`}
                                >
                                    <div>
                                        <p className={`font-semibold ${settings.cefr_level === level.value ? 'text-indigo-700' : 'text-slate-900'}`}>
                                            {level.label}
                                        </p>
                                        <p className="text-sm text-slate-500">{level.description}</p>
                                    </div>
                                    {settings.cefr_level === level.value && (
                                        <Check size={18} className="text-indigo-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Flashcards Settings */}
            <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-indigo-100 rounded-xl">
                        <BookOpen className="text-indigo-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Flashcards</h3>
                        <p className="text-slate-500 text-sm">Configure your flashcard learning sessions</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Words per session */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="font-medium text-slate-700">Words per session</label>
                            <span className="text-sm text-slate-500">10 - 100</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="10"
                                max="100"
                                step="5"
                                value={settings.flashcards_per_session}
                                onChange={(e) => handleNumberChange('flashcards_per_session', e.target.value, 10, 100)}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <input
                                type="number"
                                min="10"
                                max="100"
                                value={settings.flashcards_per_session}
                                onChange={(e) => handleNumberChange('flashcards_per_session', e.target.value, 10, 100)}
                                className="w-20 px-3 py-2 text-center font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Word repetitions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <label className="font-medium text-slate-700">Word repetitions</label>
                                <p className="text-xs text-slate-400">How many times to repeat each word</p>
                            </div>
                            <span className="text-sm text-slate-500">1 - 10</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={settings.word_repetitions}
                                onChange={(e) => handleNumberChange('word_repetitions', e.target.value, 1, 10)}
                                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex items-center gap-2">
                                <RefreshCw size={16} className="text-slate-400" />
                                <input
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={settings.word_repetitions}
                                    onChange={(e) => handleNumberChange('word_repetitions', e.target.value, 1, 10)}
                                    className="w-20 px-3 py-2 text-center font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Test Settings */}
            <Card className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <ClipboardCheck className="text-emerald-600" size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Tests</h3>
                        <p className="text-slate-500 text-sm">Configure your test preferences</p>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="font-medium text-slate-700">Questions per test</label>
                        <span className="text-sm text-slate-500">5 - 50</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={settings.questions_per_test}
                            onChange={(e) => handleNumberChange('questions_per_test', e.target.value, 5, 50)}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <input
                            type="number"
                            min="5"
                            max="50"
                            value={settings.questions_per_test}
                            onChange={(e) => handleNumberChange('questions_per_test', e.target.value, 5, 50)}
                            className="w-20 px-3 py-2 text-center font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Quick Presets */}
            <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Presets</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setSettings({
                            ...settings,
                            flashcards_per_session: 15,
                            word_repetitions: 2,
                            questions_per_test: 10
                        })}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                        <p className="font-semibold text-slate-800">Quick Session</p>
                        <p className="text-sm text-slate-500">15 words, 2 reps, 10 questions</p>
                    </button>
                    <button
                        onClick={() => setSettings({
                            ...settings,
                            flashcards_per_session: 30,
                            word_repetitions: 3,
                            questions_per_test: 20
                        })}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                        <p className="font-semibold text-slate-800">Standard</p>
                        <p className="text-sm text-slate-500">30 words, 3 reps, 20 questions</p>
                    </button>
                    <button
                        onClick={() => setSettings({
                            ...settings,
                            flashcards_per_session: 50,
                            word_repetitions: 5,
                            questions_per_test: 30
                        })}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-left"
                    >
                        <p className="font-semibold text-slate-800">Intensive</p>
                        <p className="text-sm text-slate-500">50 words, 5 reps, 30 questions</p>
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;
