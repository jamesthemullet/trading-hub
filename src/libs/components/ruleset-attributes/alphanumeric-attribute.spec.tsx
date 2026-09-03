import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { AlphanumericAttribute } from './alphanumeric-attribute';

const fields = [{ field: 'colour', values: ['Blue'] }];

describe('AlphanumericAttribute', () => {
  describe('editing weight', () => {
    it('calls setWeight with the parsed strength value on change', async () => {
      const user = userEvent.setup();
      const setWeight = jest.fn();

      renderWithProviders(
        <AlphanumericAttribute
          fields={fields}
          operation="boost"
          weight={20}
          isEditMode
          canEditWeight
          setWeight={setWeight}
        />
      );

      const input = screen.getByLabelText('Strength');

      await user.tripleClick(input);
      await user.keyboard('7');

      expect(setWeight).toHaveBeenCalledWith(7);
    });

    it('falls back to 0 when the strength input is cleared', async () => {
      const user = userEvent.setup();
      const setWeight = jest.fn();

      renderWithProviders(
        <AlphanumericAttribute
          fields={fields}
          operation="boost"
          weight={20}
          isEditMode
          canEditWeight
          setWeight={setWeight}
        />
      );

      const input = screen.getByLabelText('Strength %');

      await user.clear(input);

      expect(setWeight).toHaveBeenCalledWith(0);
    });

    it('does not throw when setWeight is not provided', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <AlphanumericAttribute
          fields={fields}
          operation="boost"
          weight={20}
          isEditMode
          canEditWeight
        />
      );

      const input = screen.getByLabelText('Strength %');

      await user.tripleClick(input);
      await user.keyboard('7');

      expect((input as HTMLInputElement).value).toBe('20');
    });
  });
});
