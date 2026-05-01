import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { InfoBox } from './info-box';

describe('InfoBox', () => {
  it('should render the text', () => {
    renderWithProviders(<InfoBox text="test info" />);
    expect(screen.getByText('test info')).toBeVisible();
  });

  it('should render the icon by default', () => {
    const { container } = renderWithProviders(<InfoBox text="test info" />);
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('should hide the icon when showIcon is false', () => {
    const { container } = renderWithProviders(
      <InfoBox text="test info" showIcon={false} />
    );
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('should render title when provided', () => {
    renderWithProviders(<InfoBox text="action text" title="Issue reason" />);
    expect(screen.getByText('Issue reason')).toBeVisible();
    expect(screen.getByText('action text')).toBeVisible();
  });

  it('should apply the error variant via data-variant attribute', () => {
    renderWithProviders(
      <InfoBox text="action text" title="Issue reason" variant="error" />
    );
    expect(
      screen.getByText('action text').closest('[data-variant="error"]')
    ).toBeInTheDocument();
  });

  it('should default to info variant', () => {
    renderWithProviders(<InfoBox text="test info" />);
    expect(
      screen.getByText('test info').closest('[data-variant="info"]')
    ).toBeInTheDocument();
  });
});
