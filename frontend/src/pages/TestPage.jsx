import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Volume2, 
  Check, 
  X, 
  ArrowRight, 
  Trophy, 
  RotateCcw, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { testService } from '../services/testService';

const TestPage = () => {
  const { level } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testSession, setTestSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    loadTest();
  }, [level]);

  const loadTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await testService.startTest(level);
      setTestSession(session);
      setCurrentIndex(0);
      setScore(0);
      setAnswers([]);
      setIsFinished(false);
      setFinalResult(null);
    } catch (err) {
      setError(err.message || 'Failed to load test');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedOption !== null) return;

    const currentQuestion = testSession.questions[currentIndex];
    setSelectedOption(option);
    const correct = option === currentQuestion.correct_answer;
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
    }

    // Record the answer
    setAnswers(prev => [...prev, {
      question_index: currentIndex,
      word_id: currentQuestion.word_id,
      question: currentQuestion.question,
      selected_answer: option,
      correct_answer: currentQuestion.correct_answer,
    }]);
  };

  const nextQuestion = async () => {
    if (currentIndex < testSession.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Submit the test - include current answer since state might not be updated yet
      setSubmitting(true);
      
      // Build the complete answers array including the current answer
      const currentQuestion = testSession.questions[currentIndex];
      const allAnswers = [...answers];
      
      // Check if current answer is already in the array (avoid duplicates)
      const currentAnswerExists = allAnswers.some(a => a.question_index === currentIndex);
      if (!currentAnswerExists && selectedOption) {
        allAnswers.push({
          question_index: currentIndex,
          word_id: currentQuestion.word_id,
          question: currentQuestion.question,
          selected_answer: selectedOption,
          correct_answer: currentQuestion.correct_answer,
        });
      }
      
      try {
        const result = await testService.submitTest(level, allAnswers);
        setFinalResult(result);
        setIsFinished(true);
      } catch (err) {
        console.error('Failed to submit test:', err);
        // Still show results locally
        setIsFinished(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRetry = () => {
    loadTest();
  };

  const handleExit = () => {
    navigate('/learning/tests');
  };

  // Get question type label
  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'article': return 'Article';
      case 'meaning': return 'Meaning';
      case 'collocation': return 'Collocation';
      case 'sentence': return 'Sentence';
      default: return 'Question';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500">Loading test questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <p className="text-lg font-medium text-slate-800">Failed to load test</p>
        <p className="text-slate-500">{error}</p>
        <div className="flex gap-3 mt-4">
          <button 
            onClick={handleExit}
            className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            Back to Tests
          </button>
          <button 
            onClick={loadTest}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!testSession || !testSession.questions?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <BookOpen className="w-12 h-12 text-slate-300" />
        <p className="text-lg font-medium text-slate-800">No questions available</p>
        <p className="text-slate-500">There are no test questions for level {level}</p>
        <button 
          onClick={handleExit}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors mt-4"
        >
          Back to Tests
        </button>
      </div>
    );
  }

  const currentQuestion = testSession.questions[currentIndex];
  const finalScore = finalResult?.percentage || Math.round((score / testSession.questions.length) * 100);

  // Result View
  if (isFinished) {
    return (
      <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden text-center p-8 border border-slate-200">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="text-yellow-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Test Complete!</h2>
          <p className="text-slate-500 mb-2">Level {level}</p>
          <p className="text-slate-400 mb-8">You scored</p>
          
          <div className={`text-6xl font-extrabold mb-2 ${
            finalScore >= 80 ? 'text-emerald-600' : 
            finalScore >= 50 ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {finalScore}%
          </div>
          <p className="text-sm text-slate-400 mb-8">
            {finalResult?.correct_answers || score} out of {testSession.questions.length} correct
          </p>

          {finalScore >= 80 && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-medium mb-8">
              <Check size={18} /> Excellent work!
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleExit}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors"
            >
              Back to List
            </button>
            <button 
              onClick={handleRetry}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={18} /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Question View
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 flex items-center gap-4">
        <button 
          onClick={handleExit} 
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex) / testSession.questions.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-slate-500">
          {currentIndex + 1}/{testSession.questions.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 relative">
        {/* Card Header: The Question */}
        <div className="bg-slate-50 border-b border-slate-100 p-8 text-center min-h-[180px] flex flex-col justify-center items-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600">
              {getQuestionTypeLabel(currentQuestion.question_type)}
            </span>
            <span className={`px-2 py-0.5 rounded ${
              currentQuestion.difficulty === 'easy' 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-amber-100 text-amber-600'
            }`}>
              {currentQuestion.difficulty}
            </span>
          </span>
          
          {/* Question Text */}
          <p className="text-xl md:text-2xl font-medium text-slate-700 leading-relaxed max-w-full">
            {currentQuestion.question}
          </p>

          {/* Word hint */}
          {currentQuestion.word && (
            <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
              <Volume2 
                size={16} 
                className="cursor-pointer hover:text-indigo-600 transition-colors" 
                onClick={() => playAudio(currentQuestion.word)}
              />
              <span className="italic">Word: {currentQuestion.word}</span>
            </div>
          )}
        </div>

        {/* Card Body: Options & Controls */}
        <div className="p-6 bg-white">
          
          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {currentQuestion.options.map((option, idx) => {
              let btnStyle = "bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50";
              
              if (selectedOption !== null) {
                if (option === currentQuestion.correct_answer) {
                  btnStyle = "bg-emerald-50 border-2 border-emerald-500 text-emerald-700 font-bold";
                } else if (option === selectedOption && !isCorrect) {
                  btnStyle = "bg-rose-50 border-2 border-rose-500 text-rose-700 opacity-70";
                } else {
                  btnStyle = "bg-slate-50 border-2 border-slate-100 text-slate-300 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={selectedOption !== null}
                  className={`py-4 px-3 rounded-xl text-base font-medium transition-all duration-200 active:scale-[0.98] ${btnStyle}`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Footer / Next Button Area */}
          <div className="h-16 flex items-center justify-center">
            {selectedOption === null ? (
              <p className="text-slate-400 text-sm animate-pulse">Select the correct answer</p>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={submitting}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 animate-in slide-in-from-bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Submitting...
                  </>
                ) : currentIndex < testSession.questions.length - 1 ? (
                  <>Continue <ArrowRight size={20} /></>
                ) : (
                  <>Finish Test <Check size={20} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Explanation Feedback */}
      {selectedOption !== null && (
        <div className={`mt-4 animate-in slide-in-from-top-2 duration-200 rounded-xl p-4 flex items-start gap-3 shadow-sm ${
          isCorrect 
            ? 'bg-emerald-50 border border-emerald-100' 
            : 'bg-rose-50 border border-rose-100'
        }`}>
          <div className={`p-2 rounded-full shadow-sm ${
            isCorrect ? 'bg-white text-emerald-500' : 'bg-white text-rose-500'
          }`}>
            {isCorrect ? <Check size={18} /> : <X size={18} />}
          </div>
          <div className="flex-1">
            <span className={`text-xs font-bold uppercase ${
              isCorrect ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            {currentQuestion.explanation && (
              <p className={`text-sm mt-1 ${
                isCorrect ? 'text-emerald-900' : 'text-rose-900'
              }`}>
                {currentQuestion.explanation}
              </p>
            )}
            {!isCorrect && (
              <p className="text-sm mt-2 font-medium text-rose-700">
                Correct answer: <span className="font-bold">{currentQuestion.correct_answer}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPage;
