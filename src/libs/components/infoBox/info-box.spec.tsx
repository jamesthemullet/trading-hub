import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { InfoBox } from './info-box';

describe('Info Box', () => {
  it('should render info box', () => {
    renderWithProviders(<InfoBox text="test info" />);

    expect(screen.getByText('test info')).toBeVisible();
  });
});
