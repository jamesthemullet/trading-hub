import '@testing-library/jest-dom';

import { linkStyles } from './link-styles';

describe('link styles', () => {
  it('returns the correct bacgkground-color for landingPagePrimary', () => {
    const { styles } = linkStyles({
      backgroundColor: 'red',
    }).landingPagePrimary;

    expect(styles).toContain('background-color: red');
  });
});
