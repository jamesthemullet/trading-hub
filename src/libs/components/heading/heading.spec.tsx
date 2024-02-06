import { render, screen } from '@testing-library/react';


import { Heading } from './heading';

describe('Heading', () => {
  it('should render correctly', () => {
    render(<Heading breadcrumbs={['Ranking Rules']} />);

    expect(screen.getByText('Ranking Rules')).toBeInTheDocument();
  });
});
