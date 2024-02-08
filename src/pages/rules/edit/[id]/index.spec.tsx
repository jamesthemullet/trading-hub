import { act, screen, within, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  useCategoryProductSearch,
  useRuleSetPreview,
  useUpdateRuleSet,
} from '@/libs/hooks';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';
const categoryId = 'SubCategory_428';
const product1Id = 'a1';
const product2Id = 'b2';
const product3Id = 'c2';
const product1Title = 'first product';
const product2Title = 'second product';
const product3Title = 'third product';
const product1Brand = 'Monsoon';
const product2Brand = 'M&S';
const product1Price = '£5';
const product2Price = '£10';

jest.mock('@/libs/hooks', () => ({
  useCategoryProductSearch: jest.fn(),
  useRuleSetPreview: jest.fn(),
  useUpdateRuleSet: jest.fn(),
}));

describe('Index', () => {
  const mockPreview = {
    ruleSets: {
      categoryId: categoryId,
      categoryName: 'Cat Name',
      id: '',
      isEnabled: false,
      lastChanged: {
        date: '',
        user: '',
      },
      rules: {
        pinnedProducts: [{ id: product1Id }],
        blockedProducts: [],
        boosts: [],
      },
    },
    products: [
      {
        id: product1Id,
        title: product1Title,
        imageUrl: ['example1.jpg'],
        brand: product1Brand,
        metadata: { isPinned: false },
        isInStock: true,
        price: product1Price,
        rating: 4.5,
        url: '',
      },
      {
        id: product2Id,
        title: product2Title,
        imageUrl: ['example2.jpg'],
        brand: product2Brand,
        metadata: { isPinned: false },
        isInStock: true,
        price: product2Price,
        rating: 5,
        url: '',
      },
      {
        id: product3Id,
        title: product3Title,
        imageUrl: ['example.jpg'],
        brand: 'brand',
        metadata: { isPinned: false },
        isInStock: true,
        price: '£10',
        rating: 4.5,
        url: '',
      },
    ],
    error: '',
  };
  const mockUpdateRuleSet = {
    updateRuleSet: jest.fn(() =>
      Promise.resolve({
        rules: {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: [],
        },
        categoryId: categoryId,
        isEnabled: true,
        categoryName: 'Jeans',
        id: ruleSetId,
        lastChanged: { date: '2024-01-02T22:10:17Z', user: 'M&S' },
      })
    ),
    error: '',
  };

  const mockCategoryProductSearch = {
    handleGet: jest.fn(() => {
      return Promise.resolve({
        products: [],
        pagination: {
          totalItems: 0,
        },
      });
    }),
    error: '',
  };

  beforeEach(() => {
    jest.mocked(useUpdateRuleSet).mockImplementation(() => mockUpdateRuleSet);
    jest
      .mocked(useCategoryProductSearch)
      .mockImplementation(() => mockCategoryProductSearch);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays the category id', () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    render(<Page id={ruleSetId} />);

    expect(screen.getByText(categoryId + ' | Cat Name')).toBeVisible();
  });

  it('opens changes tab', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    render(<Page id={ruleSetId} />);

    const tab2 = await screen.findByText('Changes');

    act(() => {
      tab2.click();
    });

    expect(screen.getByText('Tab 2')).toBeVisible();
  });

  it('opens external changes tab', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    render(<Page id={ruleSetId} />);

    const tab2 = await screen.findByText('External Changes');

    act(() => {
      tab2.click();
    });

    expect(screen.getByText('Tab 3')).toBeVisible();
  });

  it('opens attributes tab', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    render(<Page id={ruleSetId} />);

    const tab2 = await screen.findByText('Attribute');

    act(() => {
      tab2.click();
    });

    expect(screen.getByText('Tab 2')).toBeVisible();
  });

  it('opens Insights tab', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    render(<Page id={ruleSetId} />);

    const tab3 = await screen.findByText('Insights');

    act(() => {
      tab3.click();
    });

    expect(screen.getByText('Tab 3')).toBeVisible();
  });

  it('should save and display changes if boosted to top', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getAllByTitle('Open menu')[1]);

    await user.click(screen.getByText('Boost to Top'));

    await user.click(screen.getByText('Save'));

    expect(screen.getAllByLabelText('Product details')[0]).toHaveTextContent(
      `${product2Brand} ${product2Title}${product2Price}ID: ${product2Id}`
    );
  });

  it('should save and display changes if locked to a specified position', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getAllByTitle('Open menu')[1]);

    await user.click(screen.getByText('Pin in position#'));

    const input = screen.getByPlaceholderText('i.e. 3');
    const confirmButton = screen.getByText('Confirm');

    await userEvent.type(input, '1');

    await user.click(confirmButton);

    const firstProduct = await screen.findByLabelText('Position 1 updated');

    expect(
      within(firstProduct).getByText(`${product2Brand} ${product2Title}`)
    ).toBeInTheDocument();
  });

  it('should clear any changes made', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);

    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getAllByTitle('Open menu')[1]);

    await user.click(screen.getByText('Boost to Top'));

    await user.click(screen.getAllByTitle('Open menu')[0]);

    await user.click(screen.getByText('Un-boost'));

    const firstProduct = await screen.findByLabelText('Position 1');

    expect(
      within(firstProduct).getByText(`${product2Brand} ${product2Title}`)
    ).toBeInTheDocument();
  });

  it('displays a error when the API fails', () => {
    jest
      .mocked(useRuleSetPreview)
      .mockImplementation(() => ({ ...mockPreview, error: 'Not Found' }));

    render(<Page id={ruleSetId} />);

    expect(screen.getByText('Error: Not Found')).toBeVisible();
  });

  it('loads the mock data', async () => {
    const mockPageId = 'abc123';
    const context = { query: { id: mockPageId } as ParsedUrlQuery };
    const result = await getServerSideProps(
      context as GetServerSidePropsContext
    );

    if (!('props' in result) || !result.props) {
      throw new Error('No props returned');
    }

    expect((await result.props).id).toBe(mockPageId);
  });

  it('searches for products', async () => {
    jest.mocked(useRuleSetPreview).mockImplementation(() => mockPreview);
    jest.mocked(useCategoryProductSearch).mockImplementation(() => ({
      ...mockCategoryProductSearch,
      handleGet: jest.fn(() => {
        return Promise.resolve({
          products: [
            {
              id: product1Id,
              title: product1Title,
              imageUrl: ['example1.jpg'],
              brand: product1Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product1Price,
              rating: 4.5,
              url: '',
            },
            {
              id: product2Id,
              title: product2Title,
              imageUrl: ['example2.jpg'],
              brand: product2Brand,
              metadata: { isPinned: false },
              isInStock: true,
              price: product2Price,
              rating: 5,
              url: '',
            },
            {
              id: product3Id,
              title: product3Title,
              imageUrl: ['example.jpg'],
              brand: 'brand',
              metadata: { isPinned: false },
              isInStock: true,
              price: '£10',
              rating: 4.5,
              url: '',
            },
          ],
          pagination: {
            totalItems: 3,
          },
        });
      }),
    }));

    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    const search = await screen.findByPlaceholderText('Search...');

    await user.type(search, '123');

    expect(screen.getByText('3 results')).toBeVisible();
  });
});
