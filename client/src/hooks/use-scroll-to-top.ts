import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A hook that scrolls to the top of the page when the location changes
 * and also provides a function to manually scroll to the top.
 */
export function useScrollToTop() {
  const [location] = useLocation();
  
  // Automatically scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);
  
  // Return a scroll function to be used manually when needed
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return { scrollToTop };
}