import type { Theme } from '@emotion/react';

import { mediaQuery } from './media-query';
import { dotcomTheme } from './constants';

describe('mediaQuery', () => {
  it('should return media query', () => {
    const grid: (typeof dotcomTheme)['grid'] = {
      containerMaxWidth: 1280,
      numberOfColumns: 12,
      numberOfColumnsMobile: 4,
      gutterWidth: {
        sm: 8,
        md: 16,
      },
      breakPoints: {
        md: 768,
        lg: 1024,
        xl: 1280,
      },
    };

    expect(mediaQuery('md')({ theme: { grid } } as { theme: Theme })).toBe(
      '@media (min-width: 768px)'
    );
    expect(mediaQuery('lg')({ theme: { grid } } as { theme: Theme })).toBe(
      '@media (min-width: 1024px)'
    );
    expect(mediaQuery('xl')({ theme: { grid } } as { theme: Theme })).toBe(
      '@media (min-width: 1280px)'
    );
  });
});
