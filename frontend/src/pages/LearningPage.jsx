import {
    Bell,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Flame,
    Headphones,
    LayoutDashboard,
    LogOut,
    Menu,
    Mic2,
    Play,
    Settings,
    User as UserIcon,
    Volume2,
    X
} from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

const UserDropdown = ({ user, onLogout, navigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset image error when user changes
    useEffect(() => {
        setImageError(false);
    }, [user?.photoURL]);

    const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

    const menuItems = [
        { icon: UserIcon, label: 'Profile', onClick: () => navigate('/learning/profile') },
        { icon: Bell, label: 'Notifications', onClick: () => navigate('/learning/notifications') },
        { icon: Settings, label: 'Settings', onClick: () => navigate('/learning/settings') },
        { icon: LogOut, label: 'Sign Out', onClick: onLogout, danger: true },
    ];

    const showImage = user?.photoURL && !imageError;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
                {showImage ? (
                    <img
                        src={user.photoURL}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border-2 border-indigo-100"
                        onError={() => setImageError(true)}
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <UserIcon size={20} />
                    </div>
                )}
                <span className="font-semibold text-slate-700 hidden sm:block">{displayName}</span>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-bold text-slate-900">{displayName}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => {
                                setIsOpen(false);
                                item.onClick();
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                                item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
                            }`}
                        >
                            <item.icon size={18} />
                            <span className="font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const MobileNavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-indigo-600 text-white'
            : 'text-slate-600 hover:bg-slate-100'
            }`}
    >
        <Icon size={20} />
        <span className="font-semibold">{label}</span>
    </button>
);

const LearningPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Helper to determine active state
    const isActive = (path) => {
        if (path === '/learning' && location.pathname === '/learning') return true;
        if (path !== '/learning' && location.pathname.startsWith(path)) return true;
        return false;
    };

    // Page headers configuration
    const getPageHeader = () => {
        const path = location.pathname;
        
        // Dashboard - show welcome message
        if (path === '/learning') {
            return {
                title: `Welcome back${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! 👋`,
                subtitle: <>You've reached <span className="text-indigo-600 font-bold">65%</span> of your weekly goal.</>
            };
        }
        
        // Profile
        if (path === '/learning/profile') {
            return {
                title: 'Profile',
                subtitle: 'Manage your account information and subscription'
            };
        }
        
        // Settings
        if (path === '/learning/settings') {
            return {
                title: 'Settings',
                subtitle: 'Customize your learning experience and preferences'
            };
        }
        
        // Notifications
        if (path === '/learning/notifications') {
            return {
                title: 'Notifications',
                subtitle: 'Stay updated with your learning progress and reminders'
            };
        }
        
        // Listening pages
        if (path === '/learning/listening/create') {
            return {
                title: 'Create Podcast',
                subtitle: 'Generate a personalized podcast for your learning'
            };
        }
        if (path.match(/^\/learning\/listening\/[^/]+$/)) {
            return {
                title: 'Audio Player',
                subtitle: 'Listen and learn at your own pace'
            };
        }
        if (path === '/learning/listening') {
            return {
                title: 'Listening Practice',
                subtitle: 'Improve your comprehension with audio content'
            };
        }
        
        // Speaking pages
        if (path === '/learning/speaking/practice') {
            return {
                title: 'Speaking Practice',
                subtitle: 'Practice your pronunciation and fluency'
            };
        }
        if (path === '/learning/speaking') {
            return {
                title: 'Speaking',
                subtitle: 'Build confidence in your spoken language skills'
            };
        }

        // Pronunciation pages
        if (path.match(/^\/learning\/pronunciation\/[^/]+\/practice$/)) {
            return {
                title: 'Pronunciation Coach',
                subtitle: 'Practice and get instant feedback on your pronunciation'
            };
        }
        if (path.match(/^\/learning\/pronunciation\/[^/]+$/)) {
            return {
                title: 'Sound Module',
                subtitle: 'Learn and practice this German sound'
            };
        }
        if (path === '/learning/pronunciation') {
            return {
                title: 'Pronunciation',
                subtitle: 'Master German sounds with phonetic training'
            };
        }
        
        // Words pages
        if (path.match(/^\/learning\/words\/[^/]+\/flashcards$/)) {
            return {
                title: 'Flashcards',
                subtitle: 'Review and memorize vocabulary with spaced repetition'
            };
        }
        if (path.match(/^\/learning\/words\/[^/]+$/)) {
            return {
                title: 'Word Deck',
                subtitle: 'Explore and learn vocabulary in this deck'
            };
        }
        if (path === '/learning/words') {
            return {
                title: 'Word Decks',
                subtitle: 'Expand your vocabulary with curated word collections'
            };
        }
        
        // Decks page
        if (path === '/learning/decks') {
            return {
                title: 'My Decks',
                subtitle: 'Manage your personal vocabulary collections'
            };
        }
        
        // Tests pages
        if (path === '/learning/tests/select') {
            return {
                title: 'Select Test',
                subtitle: 'Choose a test level to assess your knowledge'
            };
        }
        if (path.match(/^\/learning\/tests\/[^/]+$/)) {
            return {
                title: 'Test',
                subtitle: 'Assess your knowledge and track your progress'
            };
        }
        if (path === '/learning/tests') {
            return {
                title: 'Tests',
                subtitle: 'Evaluate your language proficiency with practice tests'
            };
        }
        
        // Default fallback
        return {
            title: 'Learning',
            subtitle: 'Continue your language learning journey'
        };
    };

    const pageHeader = getPageHeader();

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">

            {/* Sidebar Navigation */}
            <aside className="w-72 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 sticky top-0 h-screen hidden lg:flex">
                <div className="flex items-center gap-2 px-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">S</div>
                    <span className="text-2xl font-extrabold tracking-tight text-slate-900">Sprache.app</span>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/learning'} onClick={() => navigate('/learning')} />
                    <SidebarItem icon={BookOpen} label="Word Decks" active={location.pathname.startsWith('/learning/words')} onClick={() => navigate('/learning/words')} />
                    <SidebarItem icon={Mic2} label="Speaking" active={location.pathname.startsWith('/learning/speaking')} onClick={() => navigate('/learning/speaking')} />
                    <SidebarItem icon={Volume2} label="Pronunciation" active={location.pathname.startsWith('/learning/pronunciation')} onClick={() => navigate('/learning/pronunciation')} />
                    <SidebarItem icon={Headphones} label="Listening" active={location.pathname.startsWith('/learning/listening')} onClick={() => navigate('/learning/listening')} />
                    <SidebarItem icon={ClipboardCheck} label="Tests" active={location.pathname.startsWith('/learning/tests')} onClick={() => navigate('/learning/tests')} />
                </nav>

                <div className="pt-6 border-t border-slate-100 space-y-2">
                    <SidebarItem icon={Settings} label="Settings" active={location.pathname === '/learning/settings'} onClick={() => navigate('/learning/settings')} />
                </div>
            </aside>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    
                    {/* Drawer */}
                    <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-slide-in">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">S</div>
                                <span className="text-xl font-extrabold tracking-tight text-slate-900">Sprache.app</span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <X size={20} className="text-slate-500" />
                            </button>
                        </div>
                        
                        {/* Navigation Items */}
                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                            <MobileNavItem 
                                icon={LayoutDashboard} 
                                label="Dashboard" 
                                active={location.pathname === '/learning'} 
                                onClick={() => { navigate('/learning'); setMobileMenuOpen(false); }} 
                            />
                            <MobileNavItem 
                                icon={BookOpen} 
                                label="Word Decks" 
                                active={location.pathname.startsWith('/learning/words')} 
                                onClick={() => { navigate('/learning/words'); setMobileMenuOpen(false); }} 
                            />
                            <MobileNavItem
                                icon={Mic2}
                                label="Speaking"
                                active={location.pathname.startsWith('/learning/speaking')}
                                onClick={() => { navigate('/learning/speaking'); setMobileMenuOpen(false); }}
                            />
                            <MobileNavItem
                                icon={Volume2}
                                label="Pronunciation"
                                active={location.pathname.startsWith('/learning/pronunciation')}
                                onClick={() => { navigate('/learning/pronunciation'); setMobileMenuOpen(false); }}
                            />
                            <MobileNavItem
                                icon={Headphones}
                                label="Listening"
                                active={location.pathname.startsWith('/learning/listening')}
                                onClick={() => { navigate('/learning/listening'); setMobileMenuOpen(false); }}
                            />
                            <MobileNavItem 
                                icon={ClipboardCheck} 
                                label="Tests" 
                                active={location.pathname.startsWith('/learning/tests')} 
                                onClick={() => { navigate('/learning/tests'); setMobileMenuOpen(false); }} 
                            />
                        </nav>
                        
                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 space-y-2">
                            <MobileNavItem 
                                icon={Settings} 
                                label="Settings" 
                                active={location.pathname === '/learning/settings'} 
                                onClick={() => { navigate('/learning/settings'); setMobileMenuOpen(false); }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">

                {/* Top Bar / Mobile Header */}
                <header className="flex flex-col gap-4 mb-12">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {/* Hamburger Menu Button - Mobile Only */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="flex lg:hidden items-center justify-center p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <Menu size={24} className="text-slate-600" />
                            </button>
                            {/* Logo - Mobile Only */}
                            <div className="lg:hidden flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">S</div>
                                <span className="text-xl font-extrabold text-slate-900">Sprache.app</span>
                            </div>
                            {/* Page Header - Desktop Only */}
                            <div className="hidden lg:block">
                                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                    {pageHeader.title}
                                </h1>
                                <p className="text-slate-500 font-medium">{pageHeader.subtitle}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                        {/* Stats - Streak and XP */}
                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl">
                                <Flame size={20} className="text-rose-500 fill-rose-500" />
                                <span className="font-extrabold text-rose-600">12 Days</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
                                <CheckCircle2 size={20} className="text-indigo-500" />
                                <span className="font-extrabold text-indigo-600">420 XP</span>
                            </div>
                        </div>

                        {/* User Dropdown */}
                        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
                            <UserDropdown user={user} onLogout={logout} navigate={navigate} />
                        </div>
                        </div>
                    </div>
                    
                    {/* Page Header - Mobile Only */}
                    <div className="lg:hidden">
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                            {pageHeader.title}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm">{pageHeader.subtitle}</p>
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
