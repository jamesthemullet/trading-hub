import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalArrowButtons } from './global-arrow-buttons';

describe('Arrow Buttons', () => {
  it('should render arrow buttons', () => {
    renderWithProviders(
      <GlobalArrowButtons
        displayName="test"
        index={0}
        searchQuery=""
        boostedRows={[
          {
            displayName: 'value1',
            attributes: ['value1'],
            isMergeGroup: false,
            isChecked: false,
          },
        ]}
        attributes={['value1']}
        rows={[
          {
            displayName: 'test',
            attributes: ['value1'],
            isMergeGroup: false,
            isChecked: false,
          },
        ]}
        disableArrows={false}
        writeEnabled
        dispatch={jest.fn()}
      />
    );
    expect(screen.getByLabelText('Move test row up')).toBeVisible();
    expect(screen.getByLabelText('Move test row down')).toBeVisible();
  });
});
