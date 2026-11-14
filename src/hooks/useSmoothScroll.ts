import { useEffect } from 'react';

/**
 * Hook previously used for desktop mouse-wheel inertia scrolling.
 * Disabled to restore default browser native scrolling on desktop/PC.
 */
export function useSmoothScroll() {
  useEffect(() => {
    // Custom desktop wheel inertia scrolling disabled to restore native browser scrolling.
  }, []);
}
