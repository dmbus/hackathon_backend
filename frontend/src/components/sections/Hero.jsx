import { Brain, Check, ChevronRight, Globe, MessageCircle, Mic, Play, Trophy, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const Hero = () => {
    const navigate = useNavigate();
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-rose-50 rounded-full blur-3xl opacity-50"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    <div className="text-center lg:text-left space-y-8">
                        <Badge color="indigo">New: AI Voice Analysis 2.0</Badge>
                        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                            Master a Language with your <span className="text-indigo-600">AI Tutor</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Stop memorizing lists. Start speaking with confidence using real-time pronunciation feedback, smart flashcards, and adaptive conversations.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button variant="primary" onClick={() => navigate('/pricing')}>
                                Start Learning for Free
                                <ChevronRight size={18} />
                            </Button>
                            <Button variant="secondary" onClick={() => navigate('/features')}>
                                <Play size={18} />
                                View Demo
                            </Button>
                        </div>
                        <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-slate-400 text-sm font-medium">
                            <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> No credit card required</span>
                            <span className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /> CEFR Certified</span>
                        </div>
                    </div>

                    {/* Phone Mockup Visual */}
                    <div className="relative mx-auto lg:ml-auto w-full max-w-[320px] lg:max-w-[380px]">
                        <div className="relative bg-slate-900 rounded-[3rem] p-4 shadow-2xl shadow-indigo-200 border-8 border-slate-900 rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            {/* Screen Content */}
                            <div className="bg-slate-50 rounded-[2.2rem] overflow-hidden h-[640px] relative">
                                {/* Header */}
                                <div className="bg-white p-6 pb-4 shadow-sm z-10 relative">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="bg-indigo-100 p-2 rounded-full"><Brain size={20} className="text-indigo-600" /></div>
                                        <Badge color="emerald">Top 5%</Badge>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full w-3/4 bg-indigo-600 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Card Stack */}
                                <div className="p-6 space-y-4">
                                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
                                        <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Translate this</span>
                                        <h3 className="text-3xl font-extrabold text-slate-800">"Where is the train station?"</h3>
                                        <div className="w-16 h-16 mx-auto bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 animate-pulse">
                                            <Mic size={32} />
                                        </div>
                                    </div>

                                    {/* Feedback Simulation */}
                                    <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                                        <div className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">AI</div>
                                            <div>
                                                <p className="text-slate-800 font-medium text-sm">Great pronunciation!</p>
                                                <p className="text-slate-500 text-xs mt-1">Try stressing the second syllable for more native flow.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Nav */}
                                <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 p-4 flex justify-around text-slate-300">
                                    <Globe className="text-indigo-600" />
                                    <Trophy />
                                    <MessageCircle />
                                </div>
                            </div>
                        </div>

                        {/* Floating Element 1 */}
                        <div className="absolute top-20 -right-12 bg-white p-4 rounded-2xl shadow-xl shadow-indigo-100 border border-slate-100 animate-bounce delay-700">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Streak!</p>
                                    <p className="text-xs text-slate-500">12 Days Fire</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Element 2 */}
                        <div className="absolute bottom-32 -left-12 bg-white p-4 rounded-2xl shadow-xl shadow-rose-100 border border-slate-100 animate-bounce duration-[2000ms]">
                            <div className="flex items-center gap-3">
                                <div className="bg-rose-100 p-2 rounded-full text-rose-600">
                                    <Volume2 size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">Native Audio</p>
                                    <p className="text-xs text-slate-500">Male & Female</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Hero;
