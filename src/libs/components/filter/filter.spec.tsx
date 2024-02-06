import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Filter, FilteredList } from './filter';

describe('Filter components', () => {
  describe('Filter', () => {
    it('should display the provided text', () => {
      const componentValue = 'text';
      render(<Filter value={componentValue} onChange={() => jest.fn()} />);

      expect(screen.getByLabelText('filter')).toHaveValue(componentValue);
    });

    it('should call function on text change', async () => {
      const user = userEvent.setup();
      const onChangeMock = jest.fn();
      const mockInputValue = 'f';
      render(<Filter onChange={onChangeMock} />);

      const filterLabel = screen.getByLabelText('filter');
      await user.type(filterLabel, mockInputValue);

      expect(onChangeMock).toHaveBeenCalledWith(mockInputValue);
    });
  });

  describe('FilteredList', () => {
    it('should render a list', () => {
      render(
        <FilteredList
          list={[
            { identifier: 'one', editor: { name: 'foo' } },
            { identifier: 'two', editor: { name: 'foo' } },
          ]}
        />
      );

      const list = screen.getByRole('list');
      const { getAllByRole } = within(list);
      const items = getAllByRole('listitem');
      expect(items.length).toBe(2);
    });
  });
});
