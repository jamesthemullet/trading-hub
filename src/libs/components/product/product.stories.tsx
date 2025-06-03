import type { Meta, StoryObj } from '@storybook/react';

import { Product } from './product';

const meta: Meta<typeof Product> = {
  title: 'Components/Product',
  component: Product,
  tags: ['autodocs'],
  argTypes: {},
  parameters: {
    layout: 'centered',
    deepControls: { enabled: true },
  },
};

export default meta;
type Story = StoryObj<typeof Product>;

export const Default = {
  args: {
    metadata: {
      isPinned: false,
      isBoosted: false,
      isBuried: false,
      isBlocked: false,

      ranking: [
        {
          property: 'Predicted Revenue Score:',
          values: ['11.59'],
        },
        {
          property: 'Days Since Launch:',
          values: ['100'],
        },
      ],
    },
    id: '60371466',
    productId: '60371466',
    title: 'Lace-Up Trainers',
    url: '/ie/lace-up-trainers/p/clp60371466?color=WHITE&image=SD_03_T03_0035_Z0_X_EC_0',
    price: '€49.00',
    brand: 'M&S Collection',
    isBrandStrong: true,
    isProductNumberEnabled: true,
    isSearchResult: false,
    isInStock: true,
    imageUrl: [
      'SD_03_T03_0035_Z0_X_EC_0',
      'SD_03_T03_0035_Z0_X_EC_0',
      'SD_03_T03_0035_Z0_X_EC_0',
      'SD_03_T03_0035_Z0_X_EC_0',
    ],
    index: 1,
    isPinnable: true,
    dispatch: () => {},
    onSelectProduct: () => {},
    isSelected: false,
    isSelectionDisabled: false,
    pinnedProductsCount: 0,
    hasSupplementaryInfo: true,
  },
  render: (args) => <Product {...args} />,
} satisfies Story;
