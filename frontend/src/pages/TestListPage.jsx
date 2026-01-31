import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  BookOpen,
  Play,
  RotateCcw,
  Search,
  Check,
  BarChart3,
  Loader2
} from 'lucide-react';
import { testService } from '../services/testService';

const TestListPage = () => {
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    setLoading(true);
    try {
      const data = await testService.getLevels();
      setLevels(data);
    } catch (error) {
      console.error('Failed to load levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (level) => {
    navigate(`/learning/tests/${level}`);
  };

  // Filter levels based on search
  const filteredLevels = levels.filter(level => 
    level.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const completedTests = levels.filter(l => l.best_score !== null).length;
  const avgScore = completedTests > 0 
    ? Math.round(levels.reduce((acc, l) => acc + (l.best_score || 0), 0) / completedTests)
    : 0;
  const totalAttempts = levels.reduce((acc, l) => acc + l.attempts, 0);

  // Get theme colors
  const getThemeColors = (theme) => {
    switch (theme) {
      case 'indigo':
        return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' };
      case 'blue':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
      case 'rose':
        return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' };
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
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Vocabulary Tests</h1>
        <p className="text-slate-500 mt-1">Test your German vocabulary by CEFR level</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Levels Completed</p>
            <p className="text-2xl font-bold text-slate-800">
              {completedTests} / {levels.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Best Avg. Score</p>
            <p className="text-2xl font-bold text-slate-800">
              {avgScore}%
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Attempts</p>
            <p className="text-2xl font-bold text-slate-800">{totalAttempts}</p>
          </div>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Available Tests</h2>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search levels..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-64"
            />
          </div>
        </div>

        {filteredLevels.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">No tests available</p>
            <p className="text-sm">Test questions will appear here when available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 pl-6">Level</th>
                  <th className="p-4">Questions</th>
                  <th className="p-4 hidden md:table-cell">Attempts</th>
                  <th className="p-4">Best Score</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLevels.map((level) => {
                  const colors = getThemeColors(level.theme);
                  return (
                    <tr 
                      key={level.level} 
                      className="group transition-colors hover:bg-indigo-50/30"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${colors.bg} ${colors.text} ${colors.border} border`}>
                            {level.level}
                          </span>
                          {level.best_score !== null && level.best_score >= 80 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <Check size={12} /> Passed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-600 text-sm">
                          {level.question_count} questions
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-slate-500 text-sm">
                          {level.attempts} {level.attempts === 1 ? 'attempt' : 'attempts'}
                        </span>
                      </td>
                      <td className="p-4">
                        {level.best_score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${level.best_score >= 80 ? 'bg-emerald-500' : level.best_score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                style={{width: `${level.best_score}%`}}
                              />
                            </div>
                            <span className="font-bold text-slate-700 text-sm">{level.best_score}%</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm italic">Not taken</span>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => handleStartTest(level.level)}
                          disabled={level.question_count === 0}
                          className={`p-2 rounded-lg shadow-sm transition-all active:scale-95 ${
                            level.question_count === 0
                              ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 group-hover:border-indigo-200'
                          }`}
                        >
                          {level.best_score !== null ? <RotateCcw size={18} /> : <Play size={18} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestListPage;
