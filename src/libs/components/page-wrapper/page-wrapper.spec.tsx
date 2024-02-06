import { render, screen } from '@testing-library/react';

import { PageWrapper } from './page-wrapper';

describe('PageWrapper', () => {
  it('should render correctly', () => {
    render(<PageWrapper>Content</PageWrapper>);

    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
