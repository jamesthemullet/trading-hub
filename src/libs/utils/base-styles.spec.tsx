import { css, Global } from '@emotion/react';
import { render } from '@testing-library/react';

import { fontStyles, resetStyles } from './base-styles';

describe('base-styles', () => {
  it('should define fontStyles', () => {
    const { container } = render(<Global styles={fontStyles} />);
    expect(container).toBeInTheDocument();
  });

  it('should define resetStyles', () => {
    const { container } = render(
      <Global
        styles={css`
          ${resetStyles()}
        `}
      />
    );
    expect(container).toBeInTheDocument();
  });
});
