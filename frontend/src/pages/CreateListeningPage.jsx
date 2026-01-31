import { ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateListeningPage() {
    const navigate = useNavigate();

    return (
        <div className="font-sans text-slate-900">
            {/* --- Top Navigation Bar --- */}
            <div className="w-full max-w-3xl mx-auto mb-6">
                <button
                    onClick={() => navigate('/learning/listening')}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-medium text-sm"
                >
                    <ChevronLeft size={16} /> Back to Library
                </button>
            </div>

            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Create Listening Lesson</h1>
                    <p className="text-slate-500">Upload audio and add a transcript to create a new lesson.</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                            Lesson Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            placeholder="e.g. Chapter 4: At the Train Station"
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows="3"
                            placeholder="Briefly describe the lesson content..."
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Audio File
                        </label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="bg-indigo-50 p-3 rounded-full mb-3 text-indigo-600">
                                <Plus size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-600">Click to upload MP3</p>
                            <p className="text-xs text-slate-400 mt-1">or drag and drop here</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/learning/listening')}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
                        >
                            Create Lesson
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
