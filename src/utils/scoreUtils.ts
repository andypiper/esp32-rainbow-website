/**
 * Formats a numeric score to display as a whole number or with one decimal place
 */
export const formatScore = (score: number) => {
  const wholeNumber = Math.floor(score);
  if (wholeNumber === score) return `${wholeNumber}`;
  return score.toFixed(1);
};

/**
 * Returns the text color classes for a score display based on the score value
 */
export const getScoreTextColor = (score: number) => {
  if (score >= 7) return 'bg-green-900 text-green-200';
  if (score >= 5) return 'bg-yellow-900 text-yellow-200';
  return 'bg-red-900 text-red-200';
};

/**
 * Returns the star color class based on the score value
 */
export const getScoreStarColor = (score: number) => {
  if (score >= 8) return 'text-yellow-400';
  if (score >= 6) return 'text-yellow-500';
  if (score >= 4) return 'text-yellow-600';
  return 'text-yellow-700';
}; 