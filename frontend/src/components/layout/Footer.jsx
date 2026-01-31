import { Facebook, Globe, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                <Globe size={20} />
                            </div>
                            <span className="font-extrabold text-xl text-slate-900">Sprache.app</span>
                        </div>
                        <p className="text-slate-500 mb-6 max-w-sm">
                            The intelligent language learning platform that adapts to your brain. Master fluency faster with AI-driven conversations.
                        </p>
                        <div className="flex gap-4">
                            {[<Twitter key="tw" size={20} />, <Linkedin key="li" size={20} />, <Facebook key="fb" size={20} />, <Instagram key="ig" size={20} />].map((icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    {icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                        <ul className="space-y-2 text-slate-600 text-sm">
                            <li><Link to="/features" className="hover:text-indigo-600">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-indigo-600">Pricing</Link></li>
                            <li><Link to="/schools" className="hover:text-indigo-600">For Schools</Link></li>
                            <li><Link to="/downloads" className="hover:text-indigo-600">Downloads</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-2 text-slate-600 text-sm">
                            <li><Link to="/about" className="hover:text-indigo-600">About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-indigo-600">Careers</Link></li>
                            <li><Link to="/blog" className="hover:text-indigo-600">Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-indigo-600">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
                        <ul className="space-y-2 text-slate-600 text-sm">
                            <li><Link to="/privacy" className="hover:text-indigo-600">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-indigo-600">Terms of Service</Link></li>
                            <li><a href="#" className="hover:text-indigo-600">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Sprache App Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="text-slate-400 text-sm flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
