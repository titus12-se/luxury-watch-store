import { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';
import { showToast } from '@/components/ui/Toast';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }
    if (!user) {
      showToast('You must be signed in to review', 'error');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      customer_id: user.id,
      customer_name: user.full_name || user.email?.split('@')[0] || 'Anonymous',
      rating,
      comment: comment.trim(),
    });
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Review submitted!', 'success');
      setComment('');
      setRating(5);
      onReviewSubmitted();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Rating</label>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHoveredStar(i + 1)}
              onMouseLeave={() => setHoveredStar(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  i < (hoveredStar || rating) ? 'text-gold fill-gold' : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this watch..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-sm resize-none"
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading || !comment.trim()}
        className="w-full bg-gold text-navy py-2 rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin mx-auto" />
        ) : (
          'Submit Review'
        )}
      </button>
    </div>
  );
}
