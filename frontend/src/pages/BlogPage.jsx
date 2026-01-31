import { Link } from 'react-router-dom';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { blogPosts } from '../data/blogPosts';

const BlogPage = () => {
    return (
        <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <Badge color="cyan">Blog</Badge>
                    <h1 className="mt-6 text-5xl font-extrabold text-slate-900 mb-6">Language Labs</h1>
                    <p className="text-xl text-slate-600">Latest news, tips, and insights from the Sprache team and community.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post) => (
                        <Link key={post.id} to={`/blog/${post.slug}`} className="block h-full">
                            <Card className="h-full flex flex-col group cursor-pointer hover:shadow-2xl transition-all duration-300">
                                <div className="h-48 overflow-hidden">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full uppercase">{post.category}</span>
                                        <span className="text-xs text-slate-400 font-medium">{post.date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-grow">{post.description}</p>
                                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                            {post.author[0]}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500">{post.author}</span>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BlogPage;
