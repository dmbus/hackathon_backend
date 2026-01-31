import {
    Bell,
    BookOpen,
    CheckCircle2,
    ClipboardCheck,
    Flame,
    Headphones,
    LayoutDashboard,
    Mic2,
    Play,
    Settings
} from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
            }`}
    >
        <Icon size={20} className={active ? 'text-white' : 'group-hover:text-indigo-600'} />
        <span className="font-semibold">{label}</span>
    </button>
);

const LearningPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to determine active state
    const isActive = (path) => {
        if (path === '/learning' && location.pathname === '/learning') return true;
        if (path !== '/learning' && location.pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">

            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen hidden lg:flex">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">L</div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">LingoFlash</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/learning'} onClick={() => navigate('/learning')} />
                    <SidebarItem icon={BookOpen} label="Word Decks" active={location.pathname.startsWith('/learning/words')} onClick={() => navigate('/learning/words')} />
                    <SidebarItem icon={Mic2} label="Speaking" active={location.pathname.startsWith('/learning/speaking')} onClick={() => navigate('/learning/speaking')} />
                    <SidebarItem icon={Headphones} label="Listening" active={location.pathname.startsWith('/learning/listening')} onClick={() => navigate('/learning/listening')} />
                    <SidebarItem icon={ClipboardCheck} label="Tests" active={location.pathname.startsWith('/learning/tests')} onClick={() => navigate('/learning/tests')} />
                </nav>

                <div className="pt-6 border-t border-slate-100 space-y-2">
                    <SidebarItem icon={Settings} label="Settings" active={location.pathname === '/learning/settings'} onClick={() => navigate('/learning/settings')} />
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">JD</div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">John Doe</p>
                                <p className="text-xs text-slate-500">Standard Plan</p>
                            </div>
                        </div>
                        <button className="w-full py-2 text-xs font-bold text-indigo-600 bg-white border border-indigo-50 rounded-lg hover:bg-indigo-50 transition-colors">Upgrade to Plus</button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">

                {/* Top Bar / Mobile Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center justify-between lg:block">
                        <div className="lg:hidden flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">L</div>
                            <span className="text-xl font-extrabold text-slate-900">LingoFlash</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome back, John! 👋</h1>
                            <p className="text-slate-500 font-medium">You've reached <span className="text-indigo-600 font-bold">65%</span> of your weekly goal.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
                        <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl">
                            <Flame size={20} className="text-rose-500 fill-rose-500" />
                            <span className="font-extrabold text-rose-600">12 Days</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
                            <CheckCircle2 size={20} className="text-indigo-500" />
                            <span className="font-extrabold text-indigo-600">420 XP</span>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                        <button className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-full transition-all">
                            <Bell size={20} />
                        </button>
                    </div>
                </header>

                {/* Dynamic Content */}
                <Outlet />

            </main>

            {/* Floating Action Button for Mobile */}
            <button className="fixed bottom-6 right-6 p-4 bg-indigo-600 text-white rounded-full shadow-2xl lg:hidden active:scale-95 transition-transform z-50">
                <Play fill="white" size={24} />
            </button>
        </div>
    );
};

export default LearningPage;
