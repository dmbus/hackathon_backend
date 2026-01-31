import { Download, Smartphone } from 'lucide-react';
import Button from '../components/ui/Button';

const DownloadsPage = () => (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-block p-4 bg-indigo-100 rounded-full text-indigo-600 mb-8">
                <Download size={48} />
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 mb-6">Take your tutor with you</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
                Sprache.app is coming to iOS and Android soon. Practice pronunciation on your commute, at the gym, or anywhere you go.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-4 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                    <Smartphone size={32} className="text-slate-400" />
                    <div className="text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase">Coming Soon</p>
                        <p className="font-bold text-slate-800">App Store</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-4 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                    <Smartphone size={32} className="text-slate-400" />
                    <div className="text-left">
                        <p className="text-xs font-bold text-slate-400 uppercase">Coming Soon</p>
                        <p className="font-bold text-slate-800">Google Play</p>
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Notify me when available</p>
                <div className="mt-4 flex max-w-sm mx-auto gap-2">
                    <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-full border border-slate-300 focus:outline-none focus:border-indigo-500" />
                    <Button variant="primary" className="px-6 py-3">Notify</Button>
                </div>
            </div>
        </div>
    </div>
);

export default DownloadsPage;
