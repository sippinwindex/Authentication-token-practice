// Add the demo banner
import { DemoBanner } from "../components/DemoBanner.jsx";

export const Layout = () => {
    return (
        <ScrollToTop>
            <div className="app-wrapper">
                <Navbar />
                <DemoBanner />  {/* Add this line */}
                <main>
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    );
};