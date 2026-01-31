import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main>
                {children ? children : <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
