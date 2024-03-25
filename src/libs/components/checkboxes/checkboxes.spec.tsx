import { act, render, screen } from '@testing-library/react';

import { Checkboxes } from '@/libs/components';

const brandNames = ['Brand name 1', 'Brand name 2'];

describe('Checkboxes', () => {
  it('should render correctly', () => {
    render(
      <Checkboxes
        values={[
          { name: brandNames[0], isSelected: false },
          { name: brandNames[1], isSelected: true },
        ]}
        onSelect={() => jest.fn()}
      />
    );

    expect(screen.getByText(brandNames[0])).toBeVisible();
  });

  it('calls callback on click', async () => {
    const mockOnSelect = jest.fn();
    render(
      <Checkboxes
        values={[
          { name: brandNames[0], isSelected: false },
          { name: brandNames[1], isSelected: true },
        ]}
        onSelect={mockOnSelect}
      />
    );

    const input1 = await screen.findByLabelText(brandNames[0]);

    act(() => {
      input1.click();
    });

    expect(mockOnSelect).toHaveBeenCalledWith(true, brandNames[0]);
  });
});
