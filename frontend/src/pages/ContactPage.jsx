import { Mail, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ContactPage = () => (
    <div className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
                <div>
                    <h1 className="text-5xl font-extrabold text-slate-900 mb-6">Let's Talk</h1>
                    <p className="text-xl text-slate-600 mb-12">
                        Have a question about our enterprise plans, or just want to say hello? We'd love to hear from you.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Email Us</h3>
                                <p className="text-slate-600">support@sprache.app</p>
                                <p className="text-slate-600">partners@sprache.app</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">Visit Us</h3>
                                <p className="text-slate-600">Torstraße 1, 10119 Berlin</p>
                                <p className="text-slate-600">Germany</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="p-8">
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500" placeholder="John" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500" placeholder="Doe" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                            <textarea className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500 h-32" placeholder="How can we help?"></textarea>
                        </div>
                        <Button type="submit" variant="primary" className="w-full">Send Message</Button>
                    </form>
                </Card>
            </div>
        </div>
    </div>
);

export default ContactPage;
