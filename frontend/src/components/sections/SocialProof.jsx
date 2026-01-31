import { Check, Globe, MessageCircle, Star } from 'lucide-react';
import Card from '../ui/Card';

const SocialProof = () => {
    return (
        <section className="py-24 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-12">Trusted by 10,000+ Active Learners</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Sarah Jenkins",
                            role: "Business Traveler",
                            text: "The 'Better Choice' suggestions are a game changer. I sounded like a textbook before, now I sound like a local.",
                            stars: 5
                        },
                        {
                            name: "David Chen",
                            role: "Student (B2 Level)",
                            text: "I love the gamified dashboard. Seeing my XP go up makes me want to study every single morning.",
                            stars: 5
                        },
                        {
                            name: "Elena Rodriguez",
                            role: "Language Enthusiast",
                            text: "Finally, an app that focuses on speaking! The pronunciation lab helped me fix my accent in weeks.",
                            stars: 5
                        }
                    ].map((testimonial, idx) => (
                        <Card key={idx} className="p-8 text-left h-full flex flex-col justify-between">
                            <div>
                                <div className="flex gap-1 mb-4 text-amber-400">
                                    {[...Array(testimonial.stars)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                                </div>
                                <p className="text-slate-600 italic mb-6">"{testimonial.text}"</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                                    {testimonial.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                                    <p className="text-xs text-slate-400 uppercase tracking-wide">{testimonial.role}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Active Learners", value: "10k+", icon: <Globe size={20} className="text-indigo-600" /> },
                        { label: "Lessons Completed", value: "50k+", icon: <Check size={20} className="text-emerald-600" /> },
                        { label: "Store Rating", value: "4.9/5", icon: <Star size={20} className="text-amber-500" /> },
                        { label: "Languages", value: "12", icon: <MessageCircle size={20} className="text-rose-500" /> },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <div className="mb-2 bg-white p-2 rounded-full shadow-sm">{stat.icon}</div>
                            <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;
