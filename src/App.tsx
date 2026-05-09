import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BrowseTrees from './components/BrowseTrees';
import MangoBoxes from './components/MangoBoxes';
import TreeVideos from './components/TreeVideos';
import Footer from './components/Footer';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import TreeDetail from './pages/TreeDetail';
import Dashboard from './pages/Dashboard';
import FarmLife from './pages/FarmLife';

function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <BrowseTrees />
      <MangoBoxes />
      <TreeVideos />
    </>
  );
}

export default function App() {
  return (
    <div id="root-top">
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trees/:id" element={<TreeDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/farm-life" element={<FarmLife />} />
      </Routes>
      <Footer />
    </div>
  );
}
