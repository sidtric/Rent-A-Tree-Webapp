import type { AdminReview } from '../types';
import { API_BASE } from '../../lib/api';

interface Props {
  reviews: AdminReview[];
  deleteReview: (id: string) => Promise<void>;
}

function ReviewCard({ review, onDelete }: { review: AdminReview; onDelete: () => void }) {
  return (
    <div className="adm-review-card">
      <div className="adm-review-top">
        <div className="adm-td-user">
          <div className="adm-avatar">{(review.name || 'A')[0].toUpperCase()}</div>
          <div>
            <div className="adm-td-name">{review.name}</div>
            <div className="adm-stars">
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="adm-review-date">
            {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button className="adm-btn-danger-sm" onClick={onDelete}>Delete</button>
        </div>
      </div>
      <p className="adm-review-text">{review.comment}</p>
      {review.media?.length > 0 && (
        <div className="adm-review-media">
          {review.media.map((m, i) =>
            m.type === 'image'
              ? <img key={i} src={`${API_BASE}${m.url}`} alt="review" />
              : <video key={i} src={`${API_BASE}${m.url}`} controls />
          )}
        </div>
      )}
    </div>
  );
}

export default function ReviewsTab({ reviews, deleteReview }: Props) {
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="adm-content">
      <header className="adm-header">
        <div>
          <h1 className="adm-h1">Reviews</h1>
          <p className="adm-sub">{reviews.length} reviews · avg {avgRating} ★</p>
        </div>
      </header>
      <div className="adm-reviews-grid">
        {reviews.map(r => (
          <ReviewCard key={r._id} review={r} onDelete={() => deleteReview(r._id)} />
        ))}
        {reviews.length === 0 && <p className="adm-empty">No reviews yet.</p>}
      </div>
    </div>
  );
}
