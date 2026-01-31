import { Check, Volume2, Zap } from 'lucide-react';
import Badge from '../ui/Badge';

const InteractiveDemo = () => {
    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    <div className="order-2 lg:order-1">
                        <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200 border border-slate-200 p-8 max-w-md mx-auto relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-t-3xl"></div>

                            {/* Chat Interface */}
                            <div className="space-y-6">
                                {/* User Message */}
                                <div className="flex gap-4 items-end">
                                    <div className="bg-slate-100 rounded-2xl rounded-bl-none p-4 max-w-[85%]">
                                        <p className="text-slate-800 font-medium">"I want go to the cinema tomorrow."</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="w-16 h-1 bg-slate-300 rounded-full overflow-hidden">
                                                <div className="w-3/4 h-full bg-amber-400"></div>
                                            </span>
                                            <span className="text-xs font-bold text-amber-600 uppercase">Grammar Check</span>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Correction */}
                                <div className="flex gap-4 items-start flex-row-reverse">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                        <Zap size={20} />
                                    </div>
                                    <div className="bg-indigo-50 rounded-2xl rounded-br-none p-5 max-w-[90%] border border-indigo-100">
                                        <p className="text-indigo-900 font-medium mb-3">Close! Here is a better choice:</p>
                                        <div className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm mb-3">
                                            <p className="text-slate-800 font-bold text-lg">"I <span className="text-indigo-600 underline decoration-2 decoration-indigo-300">would like to</span> go to the cinema."</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm hover:text-indigo-600 flex items-center gap-1">
                                                <Volume2 size={12} /> Play
                                            </button>
                                            <button className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 shadow-sm hover:text-indigo-600">
                                                Save to Deck
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-6">
                        <Badge color="rose">Pronunciation Lab</Badge>
                        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Instant Feedback Loop</h2>
                        <p className="text-xl text-slate-600">
                            Unlike a classroom, Sprache.app gives you granular feedback on every sentence. We analyze:
                        </p>
                        <ul className="space-y-4 mt-8">
                            {[
                                { label: "Grammar & Syntax", desc: "Corrects conjugation and word order instantly." },
                                { label: "Vocabulary", desc: "Suggests more natural, native-like alternatives." },
                                { label: "Pronunciation", desc: "Visualizes your intonation matches." }
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{item.label}</h4>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default InteractiveDemo;
