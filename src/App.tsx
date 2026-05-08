import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BrowseTrees from './components/BrowseTrees';
import MangoBoxes from './components/MangoBoxes';
import TreeVideos from './components/TreeVideos';
import Footer from './components/Footer';
import SignUp from './pages/SignUp';

function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <BrowseTrees />
      <MangoBoxes />
      <TreeVideos />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}
