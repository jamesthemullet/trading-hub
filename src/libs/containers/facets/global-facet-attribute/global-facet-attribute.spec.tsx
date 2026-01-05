import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalFacetAttribute } from './global-facet-attribute';

describe('GlobalFacetAttribute', () => {
  it('should render attribute', () => {
    renderWithProviders(
      <GlobalFacetAttribute
        attributes={['value1', 'value2']}
        isMergeGroup={false}
        isChecked={false}
        displayName="test"
        handleRemoveFromMerge={jest.fn()}
        dispatch={jest.fn()}
        writeEnabled
        displayType="algoControl"
      />
    );
    expect(screen.getByText('value1')).toBeVisible();
    expect(screen.getByText('value2')).toBeVisible();
  });

  it('prevents duplicate dispatches when remove button is clicked rapidly', async () => {
    const mockHandleRemoveFromMerge = jest.fn();

    const raf = jest
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        cb(0);
        return 0;
      });

    renderWithProviders(
      <GlobalFacetAttribute
        attributes={['value1', 'value2', 'value3', 'value4']}
        isMergeGroup
        isChecked={false}
        displayName="test"
        handleRemoveFromMerge={mockHandleRemoveFromMerge}
        dispatch={jest.fn()}
        writeEnabled
        displayType="algoControl"
      />
    );

    const removeButtons = screen.getAllByLabelText(/Remove merged facet for/i);
    const removeButton = removeButtons[0];

    await userEvent.click(removeButton);
    await userEvent.click(removeButton);
    await userEvent.click(removeButton);

    await waitFor(() => {
      expect(mockHandleRemoveFromMerge).toHaveBeenCalledTimes(1);
    });
    expect(mockHandleRemoveFromMerge).toHaveBeenCalledWith({
      valueToRemove: 'value1',
      mergeDisplayName: 'test',
    });

    expect(removeButton).toBeDisabled();

    raf.mockRestore();
  });
});
