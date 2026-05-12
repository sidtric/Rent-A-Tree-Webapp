import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Reviews.css';

const BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:5000';

interface Review {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  media?: { url: string; type: 'image' | 'video' }[];
  createdAt: string;
}

function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className={`rv-stars ${interactive ? 'rv-stars-interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className={`rv-star ${i <= (interactive ? (hover || rating) : rating) ? 'filled' : ''}`}
          onMouseEnter={interactive ? () => setHover(i) : undefined}
          onMouseLeave={interactive ? () => setHover(0) : undefined}
          onClick={interactive && onChange ? () => onChange(i) : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.comment.length > 160;
  const text = long && !expanded ? review.comment.slice(0, 160) + '…' : review.comment;

  return (
    <div className="rv-card">
      <Stars rating={review.rating} />
      <p className="rv-comment">
        {text}
        {long && (
          <button className="rv-read-more" onClick={() => setExpanded(e => !e)}>
            {expanded ? ' Show less' : ' Read more'}
          </button>
        )}
      </p>
      <div className="rv-card-footer">
        <div className="rv-avatar">{review.name.charAt(0).toUpperCase()}</div>
        <div className="rv-meta">
          <span className="rv-name">{review.name}</span>
          <span className="rv-date">{formatDate(review.createdAt)}</span>
        </div>
        {review.media && review.media.length > 0 && (
          <div className="rv-media-row">
            {review.media.slice(0, 2).map((m, i) =>
              m.type === 'image'
                ? <img key={i} src={m.url} alt="" className="rv-media-thumb" />
                : <video key={i} src={m.url} className="rv-media-thumb" muted />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WriteModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: Review) => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!comment.trim()) { setError('Please write a comment.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('rating', String(rating));
      fd.append('comment', comment.trim());
      files.forEach(f => fd.append('media', f));

      const res = await fetch(`${BASE}/api/reviews`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed.');
      onSubmit(data as Review);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rv-modal-overlay" onClick={onClose}>
      <div className="rv-modal" onClick={e => e.stopPropagation()}>
        <button className="rv-modal-close" onClick={onClose}>✕</button>
        <h3 className="rv-modal-title">Share Your Experience</h3>
        <p className="rv-modal-sub">How was your YourOrchard season?</p>
        <form onSubmit={handleSubmit}>
          <div className="rv-modal-stars-row">
            <Stars rating={rating} interactive onChange={setRating} />
            <span className="rv-modal-rating-label">
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Great' : rating === 5 ? 'Amazing!' : 'Tap to rate'}
            </span>
          </div>
          <textarea
            className="rv-modal-textarea"
           
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
            maxLength={800}
          />
          <div className="rv-modal-charcount">{comment.length}/800</div>
          <label className="rv-modal-upload">
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => setFiles(Array.from(e.target.files || []).slice(0, 3))}
            />
            <span className="rv-upload-btn">
              {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : '+ Add photos (optional)'}
            </span>
          </label>
          {error && <p className="rv-modal-error">{error}</p>}
          <button type="submit" className="rv-modal-submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

const PER_PAGE = 3;

export default function Reviews() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetch(`${BASE}/api/reviews`)
      .then(r => r.json())
      .then(d => setReviews(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleWriteReview() {
    if (!user) { navigate('/login', { state: { from: '/' } }); return; }
    setShowModal(true);
  }

  function handleSubmit(r: Review) {
    setReviews(prev => [r, ...prev]);
    setShowModal(false);
    setSuccess(true);
    setPage(0);
    setTimeout(() => setSuccess(false), 5000);
  }

  const displayed = reviews.slice(0, 30);
  const totalPages = Math.ceil(displayed.length / PER_PAGE);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="rv">
      <div className="rv-inner">
        <div className="rv-header">
          <span className="rv-label">From Our Orchard Members</span>
          <h2 className="rv-title">What People Are Saying</h2>
          {avg && (
            <div className="rv-avg-row">
              <span className="rv-avg-num">{avg}</span>
              <Stars rating={Math.round(Number(avg))} />
              <span className="rv-avg-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
          <p className="rv-sub">Real harvests, real families, real opinions — directly from tree renters and box buyers.</p>
        </div>

        {success && (
          <div className="rv-success">Your review is live. Thank you for sharing!</div>
        )}

        {loading ? (
          <div className="rv-slider-page">
            {[1, 2, 3].map(i => (
              <div key={i} className="rv-card rv-skeleton">
                <div className="rv-sk-stars" />
                <div className="rv-sk-line rv-sk-long" />
                <div className="rv-sk-line rv-sk-med" />
                <div className="rv-sk-line rv-sk-short" />
                <div className="rv-sk-footer" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="rv-empty">
            <p className="rv-empty-text">No reviews yet. Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="rv-slider">
            <div className="rv-slider-viewport">
              <div className="rv-slider-track" style={{ transform: `translateX(-${page * 100}%)` }}>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div key={i} className="rv-slider-page">
                    {displayed.slice(i * PER_PAGE, (i + 1) * PER_PAGE).map(r => (
                      <ReviewCard key={r._id} review={r} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {totalPages > 1 && (
              <div className="rv-slider-controls">
                <button
                  className="rv-slider-arrow"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label="Previous"
                >‹</button>
                <div className="rv-slider-dots">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`rv-dot ${i === page ? 'active' : ''}`}
                      onClick={() => setPage(i)}
                      aria-label={`Page ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  className="rv-slider-arrow"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  aria-label="Next"
                >›</button>
              </div>
            )}
          </div>
        )}

        <div className="rv-cta-row">
          <button className="rv-cta-btn" onClick={handleWriteReview}>
            {user ? 'Write a Review' : 'Login to Write a Review'}
          </button>
        </div>
      </div>

      {showModal && <WriteModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} />}
    </section>
  );
}
