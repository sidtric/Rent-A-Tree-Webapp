import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import BrowseTrees from './components/BrowseTrees';
import MangoBoxes from './components/MangoBoxes';
import TreeVideos from './components/TreeVideos';
import Footer from './components/Footer';

export default function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <HowItWorks />
      <BrowseTrees />
      <MangoBoxes />
      <TreeVideos />
      <Footer />
    </div>
  );
}
