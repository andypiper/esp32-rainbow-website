import { formatScore, getScoreTextColor, getScoreStarColor } from '../utils/scoreUtils';

interface StarRatingProps {
  score?: number;  // Score out of 10, now optional
  className?: string;
}

export default function StarRating({ score = 0, className = '' }: StarRatingProps) {
  // If no score or zero score, don't render anything
  if (!score) return null;

  // Convert 10-based score to 5-based score for stars
  const fiveBasedScore = score / 2;

  // Function to get the score display element
  const getScoreDisplay = () => {
    return (
      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getScoreTextColor(score)}`}>
          {formatScore(score)}/10
      </span>
    );
  };

  return (
    <div className={`flex items-center ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = fiveBasedScore >= star;
        const partialFill = !filled && fiveBasedScore > star - 1;
        const starColor = getScoreStarColor(Math.min(star * 2, score));
        
        return (
          <svg
            key={star}
            className={`w-5 h-5 ${filled ? starColor : 'text-gray-500'}`}
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {partialFill ? (
              // Partially filled star
              <>
                <defs>
                  <linearGradient id={`starGradient-${star}`}>
                    <stop offset={`${((fiveBasedScore % 1) * 100)}%`} stopColor={`var(--${starColor})`} />
                    <stop offset={`${((fiveBasedScore % 1) * 100)}%`} stopColor="transparent" />
                  </linearGradient>
                </defs>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  fill={`url(#starGradient-${star})`}
                  className={starColor}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </>
            ) : (
              // Regular star (filled or outlined)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            )}
          </svg>
        );
      })}
      {getScoreDisplay()}
    </div>
  );
} 