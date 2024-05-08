import { render, screen } from '@testing-library/react';

import { DefaultCategorySearchBox } from './default-category-search-box';

const mockProps = {
  defaultCategory: {
    identifier: 'Applies to all pages in marksandspencer.com',
    name: 'All products',
    path: '/',
  },
};

describe('DefaultCategorySearchBox', () => {
  it('should render correctly', () => {
    render(<DefaultCategorySearchBox {...mockProps} />);

    expect(
      screen.getByText('Applies to all pages in marksandspencer.com')
    ).toBeInTheDocument();
  });
});
