import FeaturesSection from '../components/sections/FeaturesSection';
import Hero from '../components/sections/Hero';
import InteractiveDemo from '../components/sections/InteractiveDemo';
import PricingSection from '../components/sections/PricingSection';
import SocialProof from '../components/sections/SocialProof';

const LandingPage = () => {
    return (
        <>
            <Hero />
            <FeaturesSection />
            <InteractiveDemo />
            <SocialProof />
            <PricingSection />
        </>
    );
};

export default LandingPage;
