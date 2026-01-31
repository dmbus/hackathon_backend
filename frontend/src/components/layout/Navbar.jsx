import { Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Schools', path: '/schools' },
        { name: 'Resources', path: '/blog' },
        { name: 'App', path: '/app' },
    ];

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                            <Globe size={24} />
                        </div>
                        <span className="font-extrabold text-2xl text-slate-900 tracking-tight">Sprache<span className="text-indigo-600">.app</span></span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="primary" className="!px-6 !py-2.5 !text-sm" onClick={handleGetStarted}>
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-600 hover:text-slate-900 focus:outline-none"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 absolute w-full">
                    <div className="px-4 pt-4 pb-6 space-y-2">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                {link.name}
                            </NavLink>
                        ))}
                        <NavLink
                            to="/about"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            About Us
                        </NavLink>
                        <NavLink
                            to="/careers"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            Careers
                        </NavLink>
                        <NavLink
                            to="/contact"
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            Contact
                        </NavLink>
                        <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col gap-3">
                            <Button onClick={() => { handleGetStarted(); setIsOpen(false); }} className="w-full">
                                Get Started
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
