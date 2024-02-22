import { Screen, act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent, { UserEvent } from '@testing-library/user-event';

jest.mock('../../hooks/use-get-categories', () => ({
  useGetCategories: jest.fn(),
}));
jest.mock('../../hooks/use-category-preview', () => ({
  useCategoryPreview: jest.fn(),
}));

import { Ruleset } from './ruleset';
import { useGetCategories } from '../../hooks/use-get-categories';
import { useCategoryPreview } from '../../hooks/use-category-preview';

const INPUT_PLACEHOLDER_TEXT = 'Search...';
const SAVE_BUTTON = 'Save';

const categoryId1 = 'cat_123';
const categoryName1 = 'jeans';
const categoryPath1 = 'l/jeans';
const mockGetCategories = {
  categories: [
    {
      identifier: categoryId1,
      name: categoryName1,
      path: categoryPath1,
    },
  ],
  pagination: { totalItems: 20 },
};
const mockProduct = {
  id: 'productId',
  title: 'productTitle',
  imageUrl: ['example.jpg'],
  brand: 'productBrand',
  metadata: { isPinned: false },
  isInStock: true,
  price: 'productPrice',
  rating: 4.5,
  url: '',
};

const selectCategory = async (screen: Screen, user: UserEvent) => {
  await user.type(
    screen.getByPlaceholderText(INPUT_PLACEHOLDER_TEXT),
    'SubCategory_507{enter}'
  );

  const categoryToSelect = await screen.findByText(
    `${categoryId1} | ${categoryName1} | ${categoryPath1}`
  );

  act(() => {
    categoryToSelect.click();
  });
};

describe('Ruleset', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(),
      getCategoriesError: '',
    });

    jest.mocked(useCategoryPreview).mockReturnValue({
      categoryPreview: [mockProduct, { ...mockProduct, id: 'product2' }],
      error: '',
    });
  });

  it('should render correctly', () => {
    render(<Ruleset onSave={jest.fn()} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should select a category', async () => {
    const user = userEvent.setup();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onSave={jest.fn()} />);

    await selectCategory(screen, user);

    expect(screen.getByText(categoryId1)).toBeVisible();
  });

  it('should create a new ruleset', async () => {
    const user = userEvent.setup();
    const mockCreate = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onCreate={mockCreate} />);

    await selectCategory(screen, user);

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: categoryId1 })
    );
  });

  it('should edit a ruleset', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(
      <Ruleset
        onSave={mockSave}
        rulesetCategory={{
          identifier: categoryId1,
          name: categoryName1,
          path: categoryPath1,
        }}
        rulesetMerchandisingRules={{
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        }}
        rulesetId="asd21214"
      />
    );

    await user.click(screen.getAllByTitle('Open menu')[0]);

    await user.click(screen.getByText('Boost to Top'));

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: categoryId1 })
    );
  });

  it('should not save changes with no category selected', async () => {
    const user = userEvent.setup();
    const mockSave = jest.fn();

    jest.mocked(useGetCategories).mockReturnValue({
      getCategories: jest.fn(() => Promise.resolve(mockGetCategories)),
      getCategoriesError: '',
    });

    render(<Ruleset onSave={mockSave} />);

    await selectCategory(screen, user);

    const clearButton = screen.getByLabelText('Remove selected category');

    act(() => {
      clearButton.click();
    });

    const saveButton = await screen.findByText(SAVE_BUTTON);

    act(() => {
      saveButton.click();
    });
    expect(mockSave).not.toHaveBeenCalled();
  });
});
