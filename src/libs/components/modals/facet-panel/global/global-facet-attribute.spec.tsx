import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalFacetAttribute } from './global-facet-attribute';

describe('GlobalFacetAttribute', () => {
  it('should render attribute', () => {
    renderWithProviders(
      <GlobalFacetAttribute
        attributes={['value1', 'value2']}
        isMergeGroup={false}
        displayName="test"
        handleRemoveFromMerge={jest.fn()}
      />
    );
    expect(screen.getByText('value1')).toBeVisible();
    expect(screen.getByText('value2')).toBeVisible();
  });
});
