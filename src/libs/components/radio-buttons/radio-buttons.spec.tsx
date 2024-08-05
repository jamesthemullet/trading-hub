import { act, render, screen } from '@testing-library/react';

import { RadioButtons } from '@/libs/components';

describe('RadioButtons', () => {
  const values = [
    { name: 'availabilityRating', isSelected: false },
    { name: 'averageRating', isSelected: false },
    { name: 'minPrice', isSelected: true },
  ];

  it('should render correctly', () => {
    render(
      <RadioButtons
        hasDivider
        isBold
        onSelect={() => jest.fn()}
        values={values}
      />
    );

    expect(screen.getAllByText('availabilityRating')[0]).toBeVisible();
  });

  it('should show 0 Results without values', () => {
    render(
      <RadioButtons hasDivider isBold onSelect={() => jest.fn()} values={[]} />
    );

    expect(screen.getByText('0 Results')).toBeVisible();
  });

  it('call callback on click', async () => {
    const mockOnSelect = jest.fn();
    render(
      <RadioButtons
        hasDivider={false}
        isBold={false}
        onSelect={mockOnSelect}
        values={values}
      />
    );

    const input1 = await screen.findAllByLabelText(values[0].name);

    act(() => {
      input1[0].click();
    });

    expect(mockOnSelect).toHaveBeenCalledWith(values[0].name);
  });
});
