import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import './TreeVideos.css';

interface RentedTree {
  _id: string;
  plan: 'sapling' | 'adult' | 'grand';
  variety: 'chausa' | 'dasheri' | 'langra';
  season: string;
  userName: string;
}

const PLAN_META = {
  sapling: { label: 'Sapling Tree', size: 'Small Tree', img: 'https://images.unsplash.com/photo-1542223616-9de9adb5e3e8?w=600&q=80' },
  adult:   { label: 'Adult Tree',   size: 'Mid Tree',   img: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&q=80' },
  grand:   { label: 'Grand Tree',   size: 'Big Tree',   img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
};

const VARIETY_LABEL: Record<string, string> = {
  chausa:  'Chausa Aam',
  dasheri: 'Dasheri Aam',
  langra:  'Langra Aam',
};

const PAGE = 8;

export default function TreeVideos() {
  const [trees, setTrees]     = useState<RentedTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    apiFetch<RentedTree[]>('/api/rentals/public')
      .then(setTrees)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  return (
    <section className="tv" id="orchard-board">
      <div className="tv-inner">
        <div className="tv-header">
          <span className="tv-label">Our Orchard Community</span>
          <h2 className="tv-title">Trees Rented This Season</h2>
          <p className="tv-sub">Every tree below belongs to a member of our orchard community — tended all season, delivered at harvest.</p>
        </div>

        <div className="tv-coming-soon">
          <span className="tv-coming-soon-pill">Coming Soon</span>
          <h3 className="tv-coming-soon-title">The orchard board is being prepared</h3>
          <p className="tv-coming-soon-sub">Real photos and stories from this season's rented trees will appear here once trees are assigned.</p>
        </div>
      </div>
    </section>
  );
}
