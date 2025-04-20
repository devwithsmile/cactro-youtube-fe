import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getVideoRating, rateVideo } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { FaThumbsUp, FaThumbsDown, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

export function VideoRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentRating, setCurrentRating] = useState('none');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch current video rating
  const { data: ratingData } = useQuery({
    queryKey: ['videoRating'],
    queryFn: getVideoRating,
    enabled: !!user, // Only run when user is logged in
  });

  // Update rating
  const rateMutation = useMutation({
    mutationFn: rateVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videoRating'] });
      // Invalidate video data to refresh statistics
      queryClient.invalidateQueries({ queryKey: ['video'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1000);
    },
  });

  useEffect(() => {
    if (ratingData) {
      setCurrentRating(ratingData.rating);
    }
  }, [ratingData]);

  // Handle like/dislike clicks
  const handleRating = (newRating) => {
    // If user clicks the same rating again, remove the rating
    const rating = currentRating === newRating ? 'none' : newRating;
    rateMutation.mutate(rating);
  };

  if (!user) {
    return null; // Don't show rating buttons if not logged in
  }

  return (
    <div className="flex gap-3 items-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleRating('like')}
        className={currentRating === 'like' ? 'text-green-500' : 'text-gray-500'}
        disabled={rateMutation.isPending}
      >
        <FaThumbsUp className="mr-1 h-4 w-4" />
        {rateMutation.isPending ? (
          <FaSpinner className="animate-spin ml-1 h-4 w-4" />
        ) : showSuccess && currentRating === 'like' ? (
          <FaCheck className="text-green-500 ml-1 h-4 w-4" />
        ) : (
          'Like'
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleRating('dislike')}
        className={currentRating === 'dislike' ? 'text-red-500' : 'text-gray-500'}
        disabled={rateMutation.isPending}
      >
        <FaThumbsDown className="mr-1 h-4 w-4" />
        {rateMutation.isPending ? (
          <FaSpinner className="animate-spin ml-1 h-4 w-4" />
        ) : showSuccess && currentRating === 'dislike' ? (
          <FaCheck className="text-red-500 ml-1 h-4 w-4" />
        ) : (
          'Dislike'
        )}
      </Button>

      {rateMutation.isPending && <span className="text-xs text-muted-foreground">Updating...</span>}
    </div>
  );
}
