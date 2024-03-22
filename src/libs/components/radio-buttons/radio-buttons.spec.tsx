import { render, screen } from '@testing-library/react';

import { RadioButtons } from '@/libs/components';

describe('RadioButtons', () => {
  it('should render correctly', () => {
    render(
      <RadioButtons
        values={[
          { name: 'availabilityRating', isSelected: false },
          { name: 'averageRating', isSelected: false },
          { name: 'minPrice', isSelected: true },
        ]}
      />
    );

    expect(screen.getByText('availabilityRating')).toBeVisible();
  });
});
