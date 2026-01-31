import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const CareersPage = () => (
    <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <Badge color="violet">Join Us</Badge>
                <h1 className="mt-6 text-5xl font-extrabold text-slate-900 mb-6">Build the Future of Education</h1>
                <p className="text-xl text-slate-600">We're looking for passionate individuals to help us teach the world to speak.</p>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
                {[
                    { title: "Senior AI Engineer", location: "Remote (EU)", type: "Full-time" },
                    { title: "Product Designer", location: "Berlin, Germany", type: "Full-time" },
                    { title: "Content Strategist (Spanish/French)", location: "Remote", type: "Contract" },
                    { title: "Mobile Developer (React Native)", location: "Remote (UK/EU)", type: "Full-time" }
                ].map((job, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-4 md:mb-0 text-center md:text-left">
                            <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                            <p className="text-slate-500 text-sm mt-1">{job.location} • {job.type}</p>
                        </div>
                        <Button variant="outline" className="text-sm px-6 py-2">View Role</Button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default CareersPage;
