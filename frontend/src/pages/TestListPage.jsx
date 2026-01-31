import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  BookOpen,
  Clock,
  Check,
  X,
  BarChart3,
  Loader2,
  PlusCircle,
  History,
  CalendarDays
} from 'lucide-react';
import { testService } from '../services/testService';

const TestListPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, levelsData] = await Promise.all([
        testService.getHistory(),
        testService.getLevels()
      ]);
      setHistory(historyData);
      setLevels(levelsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const totalTests = history.length;
  const avgScore = totalTests > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / totalTests)
    : 0;
  const passedTests = history.filter(h => h.score >= 80).length;

  // Get theme colors based on level
  const getThemeColors = (level) => {
    if (level?.startsWith('A')) {
      return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600' };
    } else if (level?.startsWith('B')) {
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' };
    } else if (level?.startsWith('C')) {
      return { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' };
    }
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-600' };
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
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
      {/* Actions */}
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => navigate('/learning/tests/select')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 active:scale-95"
        >
          <PlusCircle size={20} />
          Take a Test
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tests Taken</p>
            <p className="text-2xl font-bold text-slate-800">{totalTests}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Average Score</p>
            <p className="text-2xl font-bold text-slate-800">{avgScore}%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Tests Passed</p>
            <p className="text-2xl font-bold text-slate-800">{passedTests}</p>
          </div>
        </div>
      </div>

      {/* Test History */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <History size={20} className="text-slate-400" />
            <h2 className="text-xl font-bold text-slate-800">Test History</h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">No tests taken yet</p>
            <p className="text-sm mb-6">Take your first test to see your results here.</p>
            <button
              onClick={() => navigate('/learning/tests/select')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <PlusCircle size={18} />
              Start a Test
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Score</th>
                  <th className="p-4 hidden md:table-cell">Correct</th>
                  <th className="p-4 pr-6">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((result) => {
                  const colors = getThemeColors(result.level);
                  const passed = result.score >= 80;
                  return (
                    <tr 
                      key={result.id} 
                      className="group transition-colors hover:bg-indigo-50/30"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <CalendarDays size={16} className="text-slate-400" />
                          {formatDate(result.completed_at)}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${colors.bg} ${colors.text} ${colors.border} border`}>
                          {result.level}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${result.score >= 80 ? 'bg-emerald-500' : result.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{width: `${result.score}%`}}
                            />
                          </div>
                          <span className={`font-bold text-sm px-2 py-0.5 rounded ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-slate-600 text-sm">
                          {result.correct_answers} / {result.total_questions}
                        </span>
                      </td>
                      <td className="p-4 pr-6">
                        {passed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <Check size={14} /> Passed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            <X size={14} /> Failed
                          </span>
                        )}
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
