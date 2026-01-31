import { Brain, Headphones, Layers, Mic, Trophy, Volume2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const FeaturesSection = () => {
    const features = [
        {
            icon: <Brain size={24} />,
            title: "Smart Flashcards",
            description: "Interactive 3D cards with native audio and phonetic transcription using spaced repetition.",
            color: "indigo"
        },
        {
            icon: <Mic size={24} />,
            title: "AI Speaking Coach",
            description: "Real-time analysis of your fluency, grammar, and vocabulary with 'Better Choice' suggestions.",
            color: "rose"
        },
        {
            icon: <Volume2 size={24} />,
            title: "Pronunciation Lab",
            description: "Master difficult sounds with visual audio feedback compared to native speakers.",
            color: "emerald"
        },
        {
            icon: <Trophy size={24} />,
            title: "Gamified Progress",
            description: "Earn XP, maintain streaks, and climb the leaderboards in weekly leagues.",
            color: "amber"
        },
        {
            icon: <Headphones size={24} />,
            title: "Natural Voice Podcasts",
            description: "Curated audio lessons and digests with integrated comprehension tests for listening mastery.",
            color: "blue"
        },
        {
            icon: <Layers size={24} />,
            title: "Topic Collections",
            description: "Professionally designed vocabulary sets categorized by CEFR level (A1-C1) and interest topics.",
            color: "violet"
        }
    ];

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge color="indigo">Features</Badge>
                    <h2 className="mt-6 text-4xl font-extrabold text-slate-900 tracking-tight">Everything you need to reach fluency</h2>
                    <p className="mt-4 text-xl text-slate-600">Built on CEFR standards and designed to be addictive.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <Card key={idx} className="p-8 group">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 bg-${feature.color}-50 text-${feature.color}-600 group-hover:scale-110`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                            <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
