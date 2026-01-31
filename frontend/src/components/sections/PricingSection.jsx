import { Check } from 'lucide-react';
import { useState } from 'react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const PricingSection = () => {
    const [isAnnual, setIsAnnual] = useState(true);

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <Badge color="emerald">Pricing</Badge>
                    <h2 className="mt-6 text-4xl font-extrabold text-slate-900 tracking-tight">Invest in your future</h2>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setIsAnnual(!isAnnual)}
                            className="w-14 h-8 bg-indigo-600 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-sm ${isAnnual ? 'left-7' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-sm font-bold ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                            Annual <span className="text-emerald-600 text-xs ml-1 bg-emerald-50 px-2 py-0.5 rounded-full">-20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <Card className="p-8 border-slate-200">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-slate-900">Starter</h3>
                            <p className="text-slate-500 mt-2">Perfect for casual learners.</p>
                            <div className="mt-6 flex items-baseline">
                                <span className="text-5xl font-extrabold text-slate-900">$0</span>
                                <span className="text-slate-500 ml-2">/forever</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Daily Goal: 10 mins",
                                "Basic Flashcard Decks",
                                "Limited AI Feedback",
                                "Standard Audio Speed"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-600">
                                    <Check size={18} className="text-slate-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Button variant="secondary" className="w-full">Start Free</Button>
                    </Card>

                    {/* Premium Tier */}
                    <Card className="p-8 border-indigo-200 shadow-indigo-100 ring-2 ring-indigo-600 relative">
                        <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                            Most Popular
                        </div>
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-indigo-900">Sprache Plus</h3>
                            <p className="text-indigo-600/80 mt-2">Serious fluency tracking.</p>
                            <div className="mt-6 flex items-baseline">
                                <span className="text-5xl font-extrabold text-slate-900">${isAnnual ? '9.99' : '12.99'}</span>
                                <span className="text-slate-500 ml-2">/month</span>
                            </div>
                            {isAnnual && <p className="text-xs text-emerald-600 font-bold mt-2">Billed $119 yearly</p>}
                        </div>
                        <ul className="space-y-4 mb-8">
                            {[
                                "Unlimited AI Coach Access",
                                "Offline Mode",
                                "Advanced Pronunciation Lab",
                                "Custom Deck Creation",
                                "Priority Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                    <div className="bg-indigo-100 rounded-full p-0.5"><Check size={14} className="text-indigo-600" strokeWidth={3} /></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Button variant="primary" className="w-full">Start 7-Day Free Trial</Button>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
