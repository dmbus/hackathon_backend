import Badge from '../components/ui/Badge';

const AboutUsPage = () => (
    <div className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge color="blue">Our Mission</Badge>
            <h1 className="mt-6 text-5xl font-extrabold text-slate-900 mb-8">Breaking Down Language Barriers</h1>
            <p className="text-xl text-slate-600 mb-12">
                We believe that language is the key to understanding. Our mission is to make fluency accessible to everyone through the power of artificial intelligence.
            </p>
            <div className="grid md:grid-cols-2 gap-12 text-left">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">Who we are</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Founded in 2024, Sprache.app is a team of linguists, engineers, and polyglots passionate about education. We were frustrated with existing apps that felt like games but didn't actually teach you how to speak.
                    </p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">How we work</h3>
                    <p className="text-slate-600 leading-relaxed">
                        We combine cutting-edge AI with proven pedagogical methods. By analyzing millions of conversations, we've built a tutor that understands context, nuance, and culture—not just vocabulary.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

export default AboutUsPage;
