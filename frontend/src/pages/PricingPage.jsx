import PricingSection from '../components/sections/PricingSection';

const PricingPage = () => (
    <div className="pt-24">
        <PricingSection />
        <div className="bg-indigo-900 text-white py-24 text-center">
            <div className="max-w-4xl mx-auto px-4">
                <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
                <div className="grid gap-6 text-left mt-12">
                    <div className="bg-indigo-800/50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-2">Can I cancel anytime?</h4>
                        <p className="text-indigo-200">Yes, you can cancel your subscription at any time through your account settings. You'll keep access until the end of the billing period.</p>
                    </div>
                    <div className="bg-indigo-800/50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-2">Is the AI Coach included in the free plan?</h4>
                        <p className="text-indigo-200">You get 5 minutes of AI coaching per day on the free plan. Sprache Plus offers unlimited access.</p>
                    </div>
                    <div className="bg-indigo-800/50 p-6 rounded-xl">
                        <h4 className="font-bold text-lg mb-2">Which languages are supported?</h4>
                        <p className="text-indigo-200">Currently we support English, Spanish, German, French, Italian, and 7 other major languages.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default PricingPage;
