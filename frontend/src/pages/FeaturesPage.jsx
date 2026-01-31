import { BarChart, Brain, Check, ChevronRight, FileText, Globe, Headphones, Layers, MessageCircle, Mic, Play, Sparkles, Star, TrendingUp, Volume2, Zap } from 'lucide-react';
import { useState } from 'react';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const FeaturesPage = () => {
    const [activeTab, setActiveTab] = useState('speaking');

    const tabs = [
        { id: 'speaking', label: 'Speaking & Pronunciation', icon: <Mic size={18} /> },
        { id: 'memory', label: 'Memory & Vocabulary', icon: <Brain size={18} /> },
        { id: 'immersion', label: 'Listening & Context', icon: <Headphones size={18} /> },
    ];

    const features = {
        speaking: {
            title: "Your Personal AI Tutor",
            badge: "Voice Analysis 2.0",
            description: "Our proprietary AI analyzes your speech patterns 100x per second. It detects subtle intonation errors that traditional apps miss, giving you the confidence to speak up.",
            subfeatures: [
                { icon: <Zap size={18} />, text: "Real-time grammar correction during speech" },
                { icon: <Volume2 size={18} />, text: "Native accent comparison & playback" },
                { icon: <BarChart size={18} />, text: "Detailed fluency & pronunciation scores" }
            ],
            color: "indigo",
            visual: (
                <div className="relative h-full min-h-[400px] flex items-center justify-center p-8">
                    <div className="relative bg-white rounded-2xl p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border border-slate-100 max-w-xs w-full">
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Mic size={20} /></div>
                            <div>
                                <p className="font-bold text-slate-800">Speaking Drill</p>
                                <p className="text-xs text-slate-400">Intermediate • 2m left</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl">
                                <p className="text-slate-500 text-xs uppercase font-bold mb-2">You said:</p>
                                <p className="text-slate-800 font-medium">"I go to the <span className="text-rose-500 underline decoration-rose-300 decoration-wavy">shop</span> yesterday."</p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-indigo-400 text-xs uppercase font-bold mb-2 flex items-center gap-1"><Sparkles size={12} /> AI Correction:</p>
                                <p className="text-indigo-900 font-bold">"I <span className="text-indigo-600">went</span> to the <span className="text-indigo-600">store</span> yesterday."</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <div className="flex items-end gap-1 h-8">
                                {[4, 7, 5, 8, 4, 6, 9, 5].map((h, i) => (
                                    <div key={i} className="w-1.5 bg-indigo-600 rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 100}ms` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg animate-bounce duration-[3000ms]">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-100 text-emerald-600 p-1 rounded"><Check size={14} /></div>
                            <span className="text-xs font-bold text-slate-700">Perfect Pitch</span>
                        </div>
                    </div>
                </div>
            )
        },
        memory: {
            title: "Scientific Retention",
            badge: "Spaced Repetition",
            description: "We calculate the exact moment you're about to forget a word. Our adaptive algorithm prioritizes difficult concepts and 'parks' the ones you've mastered.",
            subfeatures: [
                { icon: <Layers size={18} />, text: "Curated Topic Collections (A1-C1)" },
                { icon: <Brain size={18} />, text: "Interactive 3D Flashcards" },
                { icon: <TrendingUp size={18} />, text: "Personalized memory decay curves" }
            ],
            color: "rose",
            visual: (
                <div className="relative h-full min-h-[400px] flex items-center justify-center p-8">
                    {/* Back Card */}
                    <div className="absolute bg-white rounded-2xl w-64 h-80 shadow-lg border border-slate-200 rotate-6 opacity-60 scale-95 transform translate-x-4"></div>
                    {/* Front Card */}
                    <div className="relative bg-white rounded-2xl w-64 h-80 shadow-xl border border-slate-200 flex flex-col items-center justify-between p-8 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-full flex justify-between text-slate-300">
                            <Volume2 size={20} className="hover:text-indigo-600 cursor-pointer" />
                            <Star size={20} />
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-extrabold text-slate-800 mb-2">Der Zug</p>
                            <p className="text-sm text-slate-400 font-mono">/deːɐ̯ tsuːk/</p>
                        </div>
                        <div className="w-full">
                            <button className="w-full bg-indigo-50 text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-100 transition-colors">Reveal</button>
                        </div>
                    </div>
                </div>
            )
        },
        immersion: {
            title: "Contextual Immersion",
            badge: "Natural Listening",
            description: "Don't just learn isolated words—learn how they connect. Immerse yourself in native audio content, news snippets, and podcasts tailored to your proficiency level.",
            subfeatures: [
                { icon: <Headphones size={18} />, text: "Natural Voice Podcasts (Male/Female)" },
                { icon: <Globe size={18} />, text: "Interactive transcripts with tap-to-translate" },
                { icon: <MessageCircle size={18} />, text: "Real-world dialogue simulations" }
            ],
            color: "blue",
            visual: (
                <div className="relative h-full min-h-[400px] flex items-center justify-center p-8">
                    <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Headphones size={48} className="text-white/50" />
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Morning in Berlin</h4>
                                    <p className="text-slate-500 text-sm">Episode 4 • Daily Life</p>
                                </div>
                                <Badge color="blue">B1</Badge>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full w-1/3 bg-blue-500 rounded-full"></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 font-bold">
                                    <span>04:12</span>
                                    <span>12:05</span>
                                </div>
                            </div>

                            <div className="flex justify-center gap-6 items-center text-slate-800">
                                <Button variant="ghost" className="p-0 hover:bg-transparent hover:text-blue-600"><Volume2 size={20} /></Button>
                                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 hover:scale-105 transition-transform cursor-pointer">
                                    <Play fill="currentColor" className="ml-1" />
                                </div>
                                <Button variant="ghost" className="p-0 hover:bg-transparent hover:text-blue-600"><FileText size={20} /></Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    };

    const activeContent = features[activeTab];

    return (
        <div className="pt-24 pb-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Deep Dive into Learning</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                        Sprache.app isn't just a flashcard app. It's a comprehensive language acquisition system tailored to your brain.
                    </p>

                    {/* Tab Navigation */}
                    <div className="inline-flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm overflow-x-auto max-w-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                                        ? `bg-${features[tab.id].color}-50 text-${features[tab.id].color}-600 shadow-sm`
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feature Display Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-500">
                    <div className="grid lg:grid-cols-2 min-h-[500px]">
                        {/* Text Content */}
                        <div className="p-8 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
                            <div className="mb-6">
                                <Badge color={activeContent.color}>{activeContent.badge}</Badge>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 transition-opacity duration-300">{activeContent.title}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">{activeContent.description}</p>

                            <ul className="space-y-4 mb-10">
                                {activeContent.subfeatures.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 group">
                                        <div className={`w-10 h-10 rounded-xl bg-${activeContent.color}-50 text-${activeContent.color}-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-bold text-slate-700">{item.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <div>
                                <Button variant="primary" className="w-full sm:w-auto">
                                    Try {activeContent.title}
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Visual Content */}
                        <div className={`order-1 lg:order-2 bg-${activeContent.color}-50/50 relative overflow-hidden flex items-center justify-center`}>
                            <div className={`absolute top-0 right-0 w-96 h-96 bg-${activeContent.color}-100 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2`}></div>
                            <div className={`absolute bottom-0 left-0 w-64 h-64 bg-${activeContent.color}-100 rounded-full blur-3xl opacity-50 -translate-x-1/2 translate-y-1/2`}></div>

                            <div className="relative z-10 w-full h-full">
                                {activeContent.visual}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FeaturesPage;
