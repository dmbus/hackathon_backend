import { Brain, Briefcase, Trophy } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';

const ForSchoolsPage = () => (
    <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <Badge color="amber">Education</Badge>
                <h1 className="mt-6 text-5xl font-extrabold text-slate-900 mb-6">Sprache for Schools</h1>
                <p className="text-xl text-slate-600">Empower your students with AI-driven language practice. Track progress, assign decks, and monitor fluency in real-time.</p>
                <div className="mt-8 inline-block bg-amber-50 text-amber-800 px-6 py-2 rounded-lg font-bold border border-amber-100">
                    🚧 Coming Soon to Classrooms
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {[
                    { title: "Teacher Dashboard", icon: <Briefcase />, desc: "Assign homework and track individual student performance." },
                    { title: "Classroom Leagues", icon: <Trophy />, desc: "Create friendly competition within your class to boost engagement." },
                    { title: "Custom Curriculum", icon: <Brain />, desc: "Create decks that match your textbook or syllabus perfectly." }
                ].map((item, i) => (
                    <Card key={i} className="p-8 text-center">
                        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                            {item.icon}
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-slate-600">{item.desc}</p>
                    </Card>
                ))}
            </div>
        </div>
    </div>
);

export default ForSchoolsPage;
