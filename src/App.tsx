import { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BrowseTrees from './components/BrowseTrees';
import MangoBoxes from './components/MangoBoxes';
import TreeVideos from './components/TreeVideos';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import TreeDetail from './pages/TreeDetail';
import Dashboard from './pages/Dashboard';
import FarmLife from './pages/FarmLife';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Shipping from './pages/Shipping';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import AdminPage from './pages/AdminPage';
import NotFound from './pages/NotFound';

function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <BrowseTrees />
      <MangoBoxes />
      <TreeVideos />
      <Reviews />
    </>
  );
}

const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

const AUTH_ROUTES = ['/login', '/signup'];
const NO_SHELL_ROUTES = ['/admin'];

function AuthNav() {
  const navigate = useNavigate();
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 68, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
      <img src="/logo.jpeg" alt="YourOrchard" style={{ height: 64, cursor: 'pointer', borderRadius: 6 }} onClick={() => navigate('/')} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-login" onClick={() => navigate('/login')}>Login</button>
        <button className="btn-solid" onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthPage   = AUTH_ROUTES.includes(location.pathname);
  const isAdminPage  = NO_SHELL_ROUTES.some(r => location.pathname.startsWith(r));

  useEffect(() => {
    fetch(`${BASE}/health`).catch(() => {});
  }, []);

  return (
    <div id="root-top">
      <ScrollToTop />
      {!isAdminPage && (isAuthPage ? <AuthNav /> : <Navbar />)}
      {!isAdminPage && <CartDrawer />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trees/:id" element={<TreeDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farm-life" element={<FarmLife />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAuthPage && !isAdminPage && <Footer />}
    </div>
  );
}
