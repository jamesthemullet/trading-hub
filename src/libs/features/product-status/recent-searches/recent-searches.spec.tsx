import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { RecentSearch } from '@/libs/hooks/product-status/reducer';
import { renderWithProviders } from '@/test/render-with-providers';

import { RecentSearches } from './recent-searches';

const makeSearch = (
  displayId: string,
  overrides: Partial<RecentSearch> = {}
): RecentSearch => ({
  displayId,
  title: `Product ${displayId}`,
  imageUrl: null,
  mainStatusLabel: 'Product is operational',
  mainStatusVariant: 'product-operational',
  searchedAt: 1000,
  ...overrides,
});

const onBack = jest.fn();
const onSelect = jest.fn();

afterEach(() => jest.clearAllMocks());

describe('RecentSearches', () => {
  it('renders the hero heading and subtitle', () => {
    renderWithProviders(
      <RecentSearches searches={[]} onBack={onBack} onSelect={onSelect} />
    );
    expect(
      screen.getByRole('heading', { name: 'Recent searches' })
    ).toBeInTheDocument();
    expect(screen.getByText('From this session')).toBeInTheDocument();
  });

  it('renders the correct search count', () => {
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P111'), makeSearch('P222')]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('2 recent searches')).toBeInTheDocument();
  });

  it('uses singular form for one search', () => {
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P111')]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('1 recent search')).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <RecentSearches searches={[]} onBack={onBack} onSelect={onSelect} />
    );
    await user.click(
      screen.getByRole('button', { name: 'Back to Product status' })
    );
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders a card with title, displayId and status badge for each search', () => {
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P60538523')]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Product P60538523')).toBeInTheDocument();
    expect(screen.getByText('P60538523')).toBeInTheDocument();
    expect(screen.getByText('Product is operational')).toBeInTheDocument();
  });

  it('shows "Title not available" when title is null', () => {
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P111', { title: null })]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    expect(screen.getByText('Title not available')).toBeInTheDocument();
  });

  it('calls onSelect with the displayId when "View product" is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P60538523')]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    await user.click(screen.getByRole('button', { name: 'View product' }));
    expect(onSelect).toHaveBeenCalledWith('P60538523');
  });

  it('renders the product image with an empty alt when imageUrl is set but title is null', () => {
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P111', { title: null, imageUrl: 'img.jpg' })]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    expect(screen.getByAltText('')).toBeInTheDocument();
  });

  it('shows the placeholder when imageUrl is provided but the image fails to load', () => {
    renderWithProviders(
      <RecentSearches
        searches={[
          makeSearch('P111', {
            title: 'Green Coat',
            imageUrl: 'some-image.jpg',
          }),
        ]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );

    const img = screen.getByAltText('Green Coat');
    fireEvent.error(img);

    expect(screen.queryByAltText('Green Coat')).not.toBeInTheDocument();
  });

  it('renders "View product" buttons for each card', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <RecentSearches
        searches={[makeSearch('P111'), makeSearch('P222')]}
        onBack={onBack}
        onSelect={onSelect}
      />
    );
    const buttons = screen.getAllByRole('button', { name: 'View product' });
    expect(buttons).toHaveLength(2);

    await user.click(buttons[1]);
    expect(onSelect).toHaveBeenCalledWith('P222');
  });
});
