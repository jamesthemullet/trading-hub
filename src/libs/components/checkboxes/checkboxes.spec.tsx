import { render, screen } from '@testing-library/react';

import { Checkboxes } from '@/libs/components';

describe('Checkboxes', () => {
  it('should render correctly', () => {
    render(
      <Checkboxes
        values={[
          { name: 'Brand name 1', isSelected: false },
          { name: 'Brand name 2', isSelected: true },
        ]}
      />
    );

    expect(screen.getByText('Brand name 1')).toBeVisible();
  });
});
