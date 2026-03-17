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
        displayValue="displayValue"
        order={5}
        localOrder={5}
        inputRef={jest.fn()}
        onInputChange={jest.fn()}
        onInputBlur={jest.fn()}
        onInputKeyDown={jest.fn()}
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
        displayValue="displayValue"
        order={5}
        localOrder={5}
        inputRef={jest.fn()}
        onInputChange={jest.fn()}
        onInputBlur={jest.fn()}
        onInputKeyDown={jest.fn()}
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

  it('toggles visibility when Show More/Show Fewer button is clicked', async () => {
    renderWithProviders(
      <GlobalFacetAttribute
        attributes={[
          'value1',
          'value2',
          'value3',
          'value4',
          'value5',
          'value6',
        ]}
        isMergeGroup={false}
        isChecked={false}
        displayName="test"
        handleRemoveFromMerge={jest.fn()}
        dispatch={jest.fn()}
        writeEnabled
        displayType="algoControl"
        displayValue="displayValue"
        order={5}
        localOrder={5}
        inputRef={jest.fn()}
        onInputChange={jest.fn()}
        onInputBlur={jest.fn()}
        onInputKeyDown={jest.fn()}
      />
    );

    expect(screen.getByText('value1')).toBeVisible();
    expect(screen.getByText('value4')).toBeVisible();
    expect(screen.queryByText('value5')).not.toBeInTheDocument();
    expect(screen.queryByText('value6')).not.toBeInTheDocument();

    const showMoreButton = screen.getByRole('button', { name: /show more/i });
    await userEvent.click(showMoreButton);

    expect(screen.getByText('value5')).toBeVisible();
    expect(screen.getByText('value6')).toBeVisible();

    const showFewerButton = screen.getByRole('button', { name: /show fewer/i });
    await userEvent.click(showFewerButton);

    expect(screen.queryByText('value5')).not.toBeInTheDocument();
    expect(screen.queryByText('value6')).not.toBeInTheDocument();
  });
});
