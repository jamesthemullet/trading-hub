import { render, screen } from '@testing-library/react';

import { Heading } from './heading';

describe('Heading', () => {
  it('should render correctly', () => {
    render(<Heading breadcrumbs={['Ranking Rules']} />);

    expect(screen.getByText('Ranking Rules')).toBeInTheDocument();
  });

  it('should render the banner between the breadcrumbs and the title', () => {
    render(
      <Heading
        breadcrumbs={['Ranking Rules']}
        title="Categories"
        banner={<div data-testid="banner">Read-only</div>}
      />
    );

    const breadcrumb = screen.getByText('Ranking Rules');
    const banner = screen.getByTestId('banner');
    const title = screen.getByRole('heading', { name: 'Categories' });

    expect(
      breadcrumb.compareDocumentPosition(banner) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      banner.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });
});
