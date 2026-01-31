import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';

const BlogPostPage = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);

    if (!post) {
        return (
            <div className="pt-32 pb-24 text-center">
                <h1 className="text-4xl font-bold text-slate-900">Post not found</h1>
                <Link to="/blog" className="text-indigo-600 mt-4 inline-block font-bold">Back to Blog</Link>
            </div>
        );
    }

    return (
        <article className="pt-32 pb-24 bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors">
                    <ArrowLeft size={20} /> Back to Blog
                </Link>

                <div className="mb-8">
                    <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                        {post.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">{post.title}</h1>

                    <div className="flex items-center gap-6 text-slate-500 text-sm border-b border-slate-100 pb-8 mb-8">
                        <span className="flex items-center gap-2"><User size={16} /> {post.author}</span>
                        <span className="flex items-center gap-2"><Calendar size={16} /> {post.date}</span>
                    </div>
                </div>

                <div className="prose prose-lg prose-indigo max-w-none text-slate-600">
                    <img src={post.image} alt={post.title} className="w-full h-[400px] object-cover rounded-3xl shadow-lg mb-12" />

                    <p className="lead text-xl text-slate-800 font-medium mb-8">
                        {post.description}
                    </p>

                    <p>
                        {post.content}
                    </p>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <h3>Why this matters</h3>
                    <p>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                    <ul>
                        <li>Key point one about language learning.</li>
                        <li>Another interesting fact about cognitive science.</li>
                        <li>Practical tip you can apply today.</li>
                    </ul>
                    <p>
                        Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                    </p>
                </div>
            </div>
        </article>
    );
};

export default BlogPostPage;
