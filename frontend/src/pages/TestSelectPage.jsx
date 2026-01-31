import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft,
  Play,
  Loader2,
  BookOpen,
  Check,
  AlertCircle
} from 'lucide-react';
import { testService } from '../services/testService';

// Default CEFR levels to always show
const DEFAULT_LEVELS = [
  { level: 'A1', theme: 'indigo', question_count: 0, best_score: null, attempts: 0 },
  { level: 'A2', theme: 'indigo', question_count: 0, best_score: null, attempts: 0 },
  { level: 'B1', theme: 'blue', question_count: 0, best_score: null, attempts: 0 },
  { level: 'B2', theme: 'blue', question_count: 0, best_score: null, attempts: 0 },
  { level: 'C1', theme: 'rose', question_count: 0, best_score: null, attempts: 0 },
  { level: 'C2', theme: 'rose', question_count: 0, best_score: null, attempts: 0 },
];

const TestSelectPage = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const data = await testService.getLevels();
      // Merge API data with default levels
      const mergedLevels = DEFAULT_LEVELS.map(defaultLevel => {
        const apiLevel = data.find(l => l.level === defaultLevel.level);
        return apiLevel || defaultLevel;
      });
      setLevels(mergedLevels);
    } catch (error) {
      console.error('Failed to load levels:', error);
      // Keep default levels on error
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (selectedLevel) {
      navigate(`/learning/tests/${selectedLevel}`);
    }
  };

  // Get theme colors based on level
  const getThemeColors = (theme, isSelected) => {
    if (isSelected) {
      return {
        bg: 'bg-indigo-600',
        border: 'border-indigo-600',
        text: 'text-white',
        ring: 'ring-4 ring-indigo-200'
      };
    }
    switch (theme) {
      case 'indigo':
        return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', ring: '' };
      case 'blue':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: '' };
      case 'rose':
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', ring: '' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', ring: '' };
    }
  };

  // Get level description
  const getLevelDescription = (level) => {
    switch (level) {
      case 'A1': return 'Beginner - Basic phrases and expressions';
      case 'A2': return 'Elementary - Routine tasks and direct exchanges';
      case 'B1': return 'Intermediate - Main points on familiar matters';
      case 'B2': return 'Upper Intermediate - Complex texts and discussions';
      case 'C1': return 'Advanced - Demanding texts and implicit meaning';
      case 'C2': return 'Proficient - Near-native level understanding';
      default: return 'German vocabulary test';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/learning/tests')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Tests</span>
      </button>

      {/* Level Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {levels.map((level) => {
          const isSelected = selectedLevel === level.level;
          const colors = getThemeColors(level.theme, isSelected);
          const hasQuestions = level.question_count > 0;

          return (
            <button
              key={level.level}
              onClick={() => hasQuestions && setSelectedLevel(level.level)}
              disabled={!hasQuestions}
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                hasQuestions 
                  ? `${colors.bg} ${colors.border} ${colors.ring} hover:shadow-lg cursor-pointer active:scale-[0.98]`
                  : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
              }`}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Check size={14} className="text-indigo-600" />
                </div>
              )}

              {/* Level badge */}
              <div className={`text-3xl font-extrabold mb-2 ${isSelected ? 'text-white' : colors.text}`}>
                {level.level}
              </div>

              {/* Question count */}
              <p className={`text-sm ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                {level.question_count > 0 ? `${level.question_count} questions` : 'No questions yet'}
              </p>

              {/* Best score indicator */}
              {level.best_score !== null && (
                <div className={`mt-3 text-xs font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                  Best: {level.best_score}%
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Level Info */}
      {selectedLevel && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <BookOpen className="text-indigo-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-indigo-900 mb-1">CEFR Level {selectedLevel}</h3>
              <p className="text-indigo-700 text-sm">{getLevelDescription(selectedLevel)}</p>
              <p className="text-indigo-500 text-sm mt-2">
                You will answer 20 random questions from this level.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={handleStartTest}
        disabled={!selectedLevel}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
          selectedLevel
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <Play size={22} />
        {selectedLevel ? `Start ${selectedLevel} Test` : 'Select a Level to Continue'}
      </button>

      {/* Info Note */}
      <div className="mt-6 flex items-start gap-3 text-slate-400 text-sm">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
        <p>
          Each test contains 20 questions covering articles, meanings, collocations, and sentence completion. 
          Your results will be saved to track your progress.
        </p>
      </div>
    </div>
  );
};

export default TestSelectPage;
