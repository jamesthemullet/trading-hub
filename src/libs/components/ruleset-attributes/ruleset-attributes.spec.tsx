import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MerchandisingCountryCode, MerchandisingRules } from '@/libs/api';
import { RulesetAttributes } from '@/libs/components/ruleset-attributes/ruleset-attributes';
import {
  boostMock,
  buriesMock,
  excludesMock,
  includesMock,
} from '@/pages/api/search/mocks';
import { renderWithProviders } from '@/test/render-with-providers';

import type { Action } from '../types';

jest.mock('@/libs/hooks', () => ({
  useAttributes: ({ type }: { type: string }) => {
    if (type === 'alphanumeric') {
      return {
        attributes: [
          {
            type: 'alphanumeric',
            name: 'colour',
            values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
          },
          {
            type: 'alphanumeric',
            name: 'brand',
            values: [{ value: 'Nike' }, { value: 'Adidas' }, { value: 'Puma' }],
          },
          {
            type: 'alphanumeric',
            name: 'category',
            values: [
              { value: 'Shoes' },
              { value: 'Clothing' },
              { value: 'Accessories' },
            ],
          },
        ],
      };
    }
    return {
      attributes: [
        {
          type: 'numeric',
          name: 'Size',
          values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
        },
        {
          type: 'numeric',
          name: 'Price',
          values: [
            { value: '0-50' },
            { value: '50-100' },
            { value: '100-200' },
            { value: '200+' },
          ],
        },
      ],
    };
  },
  useGlobalAttributes: () => {
    return {
      attributes: [
        {
          type: 'numeric',
          name: 'Size',
          values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
        },
      ],
    };
  },
}));

const mockRules: MerchandisingRules = {
  pinnedProducts: [],
  boosts: boostMock,
  buries: buriesMock,
  blockedProducts: [],
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};
const mockIncludeExcludeRules: MerchandisingRules = {
  pinnedProducts: [],
  boosts: {
    numeric: [],
    alphanumeric: [],
    product: [],
  },
  buries: {
    numeric: [],
    alphanumeric: [],
    product: [],
  },
  blockedProducts: [],
  includes: includesMock,
  excludes: excludesMock,
};

const mockDispatch = jest.fn();

const mockCountryCode: MerchandisingCountryCode = 'UK';

const mockProps = {
  merchandisingRules: mockRules,
  countryCode: mockCountryCode,
  writeEnabled: true,
};
const mockIncludeExcludeProps = {
  merchandisingRules: mockIncludeExcludeRules,
  countryCode: mockCountryCode,
  writeEnabled: true,
};

describe('RulesetAttributes', () => {
  const openModal = async () => {
    renderWithProviders(
      <RulesetAttributes
        {...mockProps}
        categories={['SubCategory_429']}
        dispatch={mockDispatch}
      />
    );

    const newAttributeButton = screen.getByRole('button', {
      name: 'Create new attribute rule',
    });

    act(() => {
      newAttributeButton.click();
    });

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Choose attribute type' })
      ).toBeVisible()
    );
  };

  it('should render correctly', () => {
    renderWithProviders(
      <RulesetAttributes dispatch={mockDispatch} {...mockProps} />
    );

    expect(
      screen.getByRole('button', { name: 'Create new attribute rule' })
    ).toBeVisible();
  });

  it('goes to the Numeric Attributes step and back', async () => {
    await openModal();

    expect(
      screen.getByRole('button', { name: 'Numeric attributes' })
    ).toBeVisible();

    const nextStepButton = screen.getByRole('button', {
      name: 'Numeric attributes',
    });

    act(() => {
      nextStepButton.click();
    });

    expect(
      screen.getByText(/Select one numeric attribute below/i)
    ).toBeVisible();

    const prevStepButton = screen.getAllByText('Back')[0];

    act(() => {
      prevStepButton.click();
    });

    expect(
      screen.getByRole('heading', { name: 'Choose attribute type' })
    ).toBeVisible();
  });

  it('goes to the Product description attributes', async () => {
    openModal();

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Numeric attributes' })
      ).toBeVisible()
    );

    const nextStepButton = screen.getByRole('button', {
      name: 'Product description attributes',
    });

    act(() => {
      nextStepButton.click();
    });

    expect(
      screen.getByRole('heading', { name: 'Product description attributes' })
    ).toBeVisible();

    const brandStepButton = screen.getByRole('button', { name: 'brand' });

    act(() => {
      brandStepButton.click();
    });

    const attributeSelection = screen.getByTestId('Selected attributes');

    await waitFor(() =>
      expect(within(attributeSelection).getByText('Nike')).toBeVisible()
    );

    const prevStepButton = screen.getAllByText('brand')[1];

    act(() => {
      prevStepButton.click();
    });

    expect(
      screen.getByRole('heading', { name: 'Product description attributes' })
    ).toBeVisible();

    const firstStepButton = screen.getAllByText('Back')[1];

    act(() => {
      firstStepButton.click();
    });

    expect(
      screen.getByRole('heading', { name: 'Choose attribute type' })
    ).toBeVisible();
  });

  it('cancels changes', async () => {
    await openModal();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    act(() => {
      cancelButton.click();
    });
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Choose attribute type' })
      ).not.toBeVisible()
    );
  });

  it('selects a numeric attribute', async () => {
    await openModal();

    const nextStepButton = screen.getByRole('button', {
      name: 'Numeric attributes',
    });

    act(() => {
      nextStepButton.click();
    });

    const sizeButton = screen.getAllByLabelText('Size');

    act(() => {
      sizeButton[0].click();
    });

    const attributes = screen.getByTestId('Selected Attribute');

    await waitFor(() =>
      expect(within(attributes).getByText('Size')).toBeVisible()
    );
  });

  it('filters a numeric attribute', async () => {
    const user = userEvent.setup();
    await openModal();

    const nextStepButton = screen.getByRole('button', {
      name: 'Numeric attributes',
    });

    act(() => {
      nextStepButton.click();
    });

    await user.type(screen.getByLabelText('Filter numeric attributes'), 'Size');

    expect(screen.queryByText('Price')).not.toBeInTheDocument();
  });

  it('selects Product description attributes', async () => {
    await openModal();

    const nextStepButton = screen.getAllByText(
      'Product description attributes'
    )[0];

    act(() => {
      nextStepButton.click();
    });

    const colourButton = screen.getByRole('button', { name: 'colour' });

    act(() => {
      colourButton.click();
    });

    const colourRedButton = screen.getByLabelText('Red');
    const colourBlueButton = screen.getByLabelText('Blue');

    act(() => {
      colourRedButton.click();
      colourBlueButton.click();
      colourRedButton.click();
    });

    const attributes = screen.getByTestId('Selected Attribute');

    await waitFor(() =>
      expect(within(attributes).getByText('Blue')).toBeVisible()
    );
  });

  it('filters Product description attributes', async () => {
    const user = userEvent.setup();
    await openModal();

    const nextStepButton = screen.getAllByText(
      'Product description attributes'
    )[0];

    act(() => {
      nextStepButton.click();
    });

    await user.type(
      screen.getByLabelText('Filter alphanumeric attributes'),
      'Colour'
    );

    expect(screen.queryByText('Brand')).not.toBeInTheDocument();

    const colourStepButton = screen.getByRole('button', { name: 'colour' });

    act(() => {
      colourStepButton.click();
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Red')).toBeVisible();
    });

    expect(screen.getByLabelText('Blue')).toBeVisible();
    expect(screen.getByLabelText('Green')).toBeVisible();

    await user.type(screen.getByLabelText('Filter selected attributes'), 'Red');

    expect(screen.queryByLabelText('Blue')).not.toBeInTheDocument();
  });

  it('buries Product description attributes', async () => {
    await openModal();

    const nextStepButton = screen.getByRole('button', {
      name: 'Product description attributes',
    });

    act(() => {
      nextStepButton.click();
    });

    const dropdownButton = screen.getAllByRole('button', { name: 'Boost' });

    act(() => {
      dropdownButton[1].click();
    });

    const buryButton = screen.getByRole('button', { name: 'Bury' });

    act(() => {
      buryButton.click();
    });

    const colourButton = screen.getByRole('button', { name: 'colour' });

    act(() => {
      colourButton.click();
    });

    const colourRedButton = screen.getByLabelText('Red');

    act(() => {
      colourRedButton.click();
    });

    const attributes = screen.getByTestId('Selected Attribute');

    await waitFor(() =>
      expect(within(attributes).getByText('Operation Bury')).toBeVisible()
    );
  });

  it('should show headings with only alphanumeric values', () => {
    const merchandisingRules: MerchandisingRules = {
      pinnedProducts: [],
      boosts: {
        numeric: [],
        alphanumeric: [],
        product: [],
      },
      buries: {
        numeric: [],
        alphanumeric: buriesMock.alphanumeric,
        product: [],
      },
      blockedProducts: [],
      includes: {
        alphanumeric: [],
      },
      excludes: {
        alphanumeric: [],
      },
    };

    renderWithProviders(
      <RulesetAttributes
        countryCode={mockCountryCode}
        merchandisingRules={merchandisingRules}
        dispatch={mockDispatch}
        writeEnabled={true}
      />
    );

    const rulesetAttributes = screen.getByTestId('Ruleset attributes');

    expect(
      within(rulesetAttributes).getByText('Product Description Attribute Rules')
    ).toBeVisible();
  });

  describe('adding and deleting', () => {
    it('adds boosted numeric attribute', async () => {
      const expectedCall: Action = {
        payload: {
          change: 'add',
          index: 0,
          operation: 'boost',
          data: { field: 'Size', weight: 100 },
        },
        type: 'numericAttribute',
      };

      await openModal();

      const nextStepButton = screen.getByRole('button', {
        name: 'Numeric attributes',
      });

      act(() => {
        nextStepButton.click();
      });

      const sizeButton = screen.getAllByLabelText('Size');

      act(() => {
        sizeButton[1].click();
      });

      const doneButton = screen.getByRole('button', {
        name: 'Done',
      });

      act(() => {
        doneButton.click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('adds buried numeric attribute', async () => {
      const expectedCall: Action = {
        payload: {
          change: 'add',
          index: 0,
          operation: 'bury',
          data: { field: 'Size', weight: 100 },
        },
        type: 'numericAttribute',
      };

      await openModal();

      const nextStepButton = screen.getByRole('button', {
        name: 'Numeric attributes',
      });

      const dropdownButton = screen.getAllByText('Boost');

      act(() => {
        dropdownButton[1].click();
      });

      const buryButton = screen.getAllByText('Bury');

      act(() => {
        buryButton[1].click();
      });

      act(() => {
        nextStepButton.click();
      });

      const sizeButton = screen.getAllByLabelText('Size');

      act(() => {
        sizeButton[1].click();
      });

      const doneButton = screen.getByRole('button', {
        name: 'Done',
      });

      act(() => {
        doneButton.click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('deletes numeric attributes', async () => {
      const expectedCall1: Action = {
        type: 'numericAttribute',
        payload: {
          data: mockRules.boosts.numeric[1],
          change: 'remove',
          operation: 'boost',
          index: 1,
        },
      };
      const expectedCall2: Action = {
        type: 'numericAttribute',
        payload: {
          data: mockRules.buries.numeric[0],
          change: 'remove',
          operation: 'bury',
          index: 0,
        },
      };

      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />
      );

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[3].click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall1);

      act(() => {
        deleteButton[4].click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall2);
    });

    it('adds alphanumeric attributes', async () => {
      const expectedCall: Action = {
        payload: {
          data: {
            fields: [
              {
                field: 'colour',
                values: ['Blue', 'Red'],
              },
            ],
            weight: 100,
          },
          change: 'add',
          operation: 'boost',
          index: 0,
        },
        type: 'alphanumericBoostBuryAttribute',
      };

      await openModal();

      const nextStepButton = screen.getAllByText(
        'Product description attributes'
      )[0];

      act(() => {
        nextStepButton.click();
      });

      const colourButton = screen.getByRole('button', { name: 'colour' });

      act(() => {
        colourButton.click();
      });

      const colourRedButton = screen.getByLabelText('Red');
      const colourBlueButton = screen.getByLabelText('Blue');

      act(() => {
        colourBlueButton.click();
        colourRedButton.click();
      });

      act(() => {
        screen.getByLabelText('Move back to step 2').click();
      });

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'colour' })).toBeVisible()
      );

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('deletes alphanumeric attributes', async () => {
      const expectedCall1: Action = {
        payload: {
          data: mockRules.boosts.alphanumeric[0],
          change: 'remove',
          operation: 'boost',
          index: 0,
        },
        type: 'alphanumericBoostBuryAttribute',
      };
      const expectedCall2: Action = {
        payload: {
          data: mockRules.buries.alphanumeric[0],
          change: 'remove',
          operation: 'bury',
          index: 0,
        },
        type: 'alphanumericBoostBuryAttribute',
      };

      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />
      );

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[0].click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall1);

      act(() => {
        deleteButton[1].click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall2);
    });
  });

  describe('attribute editing', () => {
    it('opens modal and adds alphanumeric attribute value', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      act(() => {
        within(screen.getByTestId('modal alphanumeric attributes list'))
          .getByText('brand')
          .click();
      });

      await waitFor(() => {
        expect(
          screen.getByText('Current matching attribute values')
        ).toBeVisible();
      });

      await waitFor(() => {
        expect(screen.getByText('Showing: 3')).toBeVisible();
      });

      const attributeSelection = screen.getByTestId('Selected attributes');
      act(() => {
        within(attributeSelection).getByText('Puma').click();
      });

      const selectedAttributes = screen.getByTestId('Selected Attribute');
      await waitFor(() => {
        expect(within(selectedAttributes).getByText('Puma')).toBeVisible();
      });
      expect(
        within(selectedAttributes).getByText('Operation Boost')
      ).toBeVisible();

      const input = screen.getByLabelText('Strength %');

      await user.clear(input);
      await user.type(input, '20');

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(screen.getAllByText('Puma')[0]).toBeVisible();

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'modify',
          data: {
            fields: [
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
              {
                field: 'brand',
                values: ['Nike', 'Adidas', 'Puma'],
              },
            ],
            weight: 20,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'alphanumericBoostBuryAttribute',
      });
    });

    it('opens modal and removes an alphanumeric attribute value', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[1].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      act(() => {
        within(screen.getByTestId('modal alphanumeric attributes list'))
          .getByText('brand')
          .click();
      });

      const attributeSelection = screen.getByTestId('Selected attributes');
      act(() => {
        within(attributeSelection).getByText('Puma').click();
      });

      const selectedAttributes = screen.getByTestId('Selected Attribute');
      await waitFor(() => {
        expect(within(selectedAttributes).queryAllByText('Puma').length).toBe(
          0
        );
      });

      act(() => {
        within(attributeSelection).getByText('Nike').click();
      });
      await waitFor(() => {
        expect(within(selectedAttributes).getByText('Nike')).toBeVisible();
      });

      expect(
        within(selectedAttributes).getByText('Operation Bury')
      ).toBeVisible();

      const input = screen.getByLabelText('Strength %');

      await user.type(input, '{Delete}{Delete}{Delete}');

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      await waitFor(() => {
        expect(screen.getAllByText('Puma')[1]).not.toBeVisible();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'modify',
          data: {
            fields: [
              {
                field: 'category',
                values: ['Accessories', 'Clothing'],
              },
              {
                field: 'brand',
                values: ['Reebok', 'Nike'],
              },
            ],
            weight: 0.7,
          },
          index: 0,
          operation: 'bury',
        },
        type: 'alphanumericBoostBuryAttribute',
      });
    });

    it('opens modal and changes alphanumeric boost/bury operation', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      const dropdownButton = screen.getAllByRole('button', { name: 'Boost' });

      act(() => {
        dropdownButton[1].click();
      });

      const buryButton = screen.getByRole('button', { name: 'Bury' });

      act(() => {
        buryButton.click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'add',
          data: {
            fields: [
              {
                field: 'brand',
                values: ['Nike', 'Adidas'],
              },
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
            ],
            weight: 0.5,
          },
          index: 0,
          operation: 'bury',
        },
        type: 'alphanumericBoostBuryAttribute',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'remove',
          data: {
            fields: [],
            weight: 0,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'alphanumericBoostBuryAttribute',
      });
    });

    it('opens modal and changes alphanumeric boost/bury to include/exclude operation', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      const dropdownButton = screen.getAllByRole('button', { name: 'Boost' });

      act(() => {
        dropdownButton[1].click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Exclude only' }).click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'add',
          data: {
            fields: [
              {
                field: 'brand',
                values: ['Nike', 'Adidas'],
              },
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
            ],
          },
          index: 0,
          operation: 'exclude',
        },
        type: 'alphanumericIncludeExcludeAttribute',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'remove',
          data: {
            fields: [],
            weight: 0,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'alphanumericBoostBuryAttribute',
      });
    });

    it('opens modal and adds alphanumeric include/exclude attribute value', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockIncludeExcludeProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      act(() => {
        within(screen.getByTestId('modal alphanumeric attributes list'))
          .getByText('brand')
          .click();
      });

      await waitFor(() => {
        expect(
          screen.getByText('Current matching attribute values')
        ).toBeVisible();
      });

      await waitFor(() => {
        expect(screen.getByText('Showing: 3')).toBeVisible();
      });

      const attributeSelection = screen.getByTestId('Selected attributes');
      act(() => {
        within(attributeSelection).getByText('Puma').click();
      });

      const selectedAttributes = screen.getByTestId('Selected Attribute');
      await waitFor(() => {
        expect(within(selectedAttributes).getByText('Puma')).toBeVisible();
      });
      expect(
        within(selectedAttributes).getByText('Operation Include')
      ).toBeVisible();

      expect(screen.queryAllByLabelText('Edit value').length).toBe(0);

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(screen.getAllByText('Puma')[0]).toBeVisible();

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'modify',
          data: {
            fields: [
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
              {
                field: 'brand',
                values: ['Nike', 'Adidas', 'Puma'],
              },
            ],
          },
          index: 0,
          operation: 'include',
        },
        type: 'alphanumericIncludeExcludeAttribute',
      });
    });

    it('opens modal and removes an alphanumeric include/exclude attribute value', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockIncludeExcludeProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[1].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      act(() => {
        within(screen.getByTestId('modal alphanumeric attributes list'))
          .getByText('brand')
          .click();
      });

      const attributeSelection = screen.getByTestId('Selected attributes');
      act(() => {
        within(attributeSelection).getByText('Puma').click();
      });

      const selectedAttributes = screen.getByTestId('Selected Attribute');
      await waitFor(() => {
        expect(within(selectedAttributes).queryAllByText('Puma').length).toBe(
          0
        );
      });

      act(() => {
        within(attributeSelection).getByText('Nike').click();
      });
      await waitFor(() => {
        expect(within(selectedAttributes).getByText('Nike')).toBeVisible();
      });

      expect(
        within(selectedAttributes).getByText('Operation Exclude')
      ).toBeVisible();

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      await waitFor(() => {
        expect(screen.getAllByText('Puma')[1]).not.toBeVisible();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'modify',
          data: {
            fields: [
              {
                field: 'category',
                values: ['Accessories', 'Clothing'],
              },
              {
                field: 'brand',
                values: ['Reebok', 'Nike'],
              },
            ],
          },
          index: 0,
          operation: 'exclude',
        },
        type: 'alphanumericIncludeExcludeAttribute',
      });
    });

    it('opens modal and changes alphanumeric include/exclude operation', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockIncludeExcludeProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      const dropdownButton = screen.getAllByRole('button', { name: 'Include' });

      act(() => {
        dropdownButton[1].click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Exclude only' }).click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'add',
          data: {
            fields: [
              {
                field: 'brand',
                values: ['Nike', 'Adidas'],
              },
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
            ],
          },
          index: 0,
          operation: 'exclude',
        },
        type: 'alphanumericIncludeExcludeAttribute',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'remove',
          data: {
            fields: [],
          },
          index: 0,
          operation: 'include',
        },
        type: 'alphanumericIncludeExcludeAttribute',
      });
    });

    it('opens modal and changes alphanumeric include/exclude to boost/bury operation', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockIncludeExcludeProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal alphanumeric attributes list')
        ).toBeVisible();
      });

      const dropdownButton = screen.getAllByRole('button', { name: 'Include' });

      act(() => {
        dropdownButton[1].click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Boost' }).click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'add',
          data: {
            fields: [
              {
                field: 'brand',
                values: ['Nike', 'Adidas'],
              },
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
            ],
            weight: 100,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'alphanumericBoostBuryAttribute',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'remove',
          data: {
            fields: [],
          },
          index: 0,
          operation: 'include',
        },
        type: 'alphanumericIncludeExcludeAttribute',
      });
    });

    it('opens modal and changes numeric attribute value', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getByLabelText('Edit attribute averageRating').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal numeric attributes list')
        ).toBeVisible();
      });

      const attributeSelection = screen.getByTestId(
        'modal numeric attributes list'
      );
      act(() => {
        within(attributeSelection).getByText('Size').click();
      });

      const selectedAttributes = screen.getByTestId('Selected Attribute');
      await waitFor(() => {
        expect(within(selectedAttributes).getByText('Size')).toBeVisible();
      });
      expect(
        within(selectedAttributes).getByText('Operation Boost')
      ).toBeVisible();

      const input = screen.getByLabelText('Strength %');

      await user.clear(input);
      await user.type(input, '20');

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'modify',
          data: {
            field: 'Size',
            weight: 20,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'numericAttribute',
      });
    });

    it('opens modal and changes numeric boost operation', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getByLabelText('Edit attribute averageRating').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal numeric attributes list')
        ).toBeVisible();
      });

      const dropdownButton = screen.getAllByRole('button', { name: 'Boost' });

      act(() => {
        dropdownButton[0].click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Bury' }).click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'add',
          data: {
            field: 'averageRating',
            weight: 0.5,
          },
          index: 0,
          operation: 'bury',
        },
        type: 'numericAttribute',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'remove',
          data: {
            field: '',
            weight: 0,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'numericAttribute',
      });
    });

    it('opens modal and changes numeric bury operation', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        []
      );

      act(() => {
        screen.getByLabelText('Edit attribute daysSinceLaunch').click();
      });

      await waitFor(() => {
        expect(
          screen.getByTestId('modal numeric attributes list')
        ).toBeVisible();
      });

      const dropdownButton = screen.getAllByRole('button', { name: 'Bury' });

      act(() => {
        dropdownButton[0].click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Boost' }).click();
      });

      act(() => {
        screen.getByRole('button', { name: 'Done' }).click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'add',
          data: {
            field: 'daysSinceLaunch',
            weight: 0.7,
          },
          index: 0,
          operation: 'boost',
        },
        type: 'numericAttribute',
      });
      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          change: 'remove',
          data: {
            field: '',
            weight: 0,
          },
          index: 0,
          operation: 'bury',
        },
        type: 'numericAttribute',
      });
    });
  });

  describe('global attributes', () => {
    it('can add numeric attributes globally', async () => {
      const expectedCall: Action = {
        payload: {
          data: { field: 'Size', weight: 100 },
          change: 'add',
          operation: 'boost',
          index: 0,
        },
        type: 'numericAttribute',
      };

      renderWithProviders(
        <RulesetAttributes {...mockProps} dispatch={mockDispatch} />
      );

      const newAttributeButton = screen.getByRole('button', {
        name: 'Create new attribute rule',
      });

      act(() => {
        newAttributeButton.click();
      });

      await waitFor(() =>
        expect(
          screen.getByRole('heading', { name: 'Choose attribute type' })
        ).toBeVisible()
      );

      const nextStepButton = screen.getByRole('button', {
        name: 'Numeric attributes',
      });

      act(() => {
        nextStepButton.click();
      });

      const sizeButton = screen.getAllByLabelText('Size');

      act(() => {
        sizeButton[1].click();
      });

      const doneButton = screen.getByRole('button', {
        name: 'Done',
      });

      act(() => {
        doneButton.click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('can cancel editing', async () => {
      renderWithProviders(
        <RulesetAttributes {...mockProps} dispatch={mockDispatch} />
      );

      const newAttributeButton = screen.getByRole('button', {
        name: 'Create new attribute rule',
      });

      act(() => {
        newAttributeButton.click();
      });

      await waitFor(() =>
        expect(
          screen.getByRole('heading', { name: 'Choose attribute type' })
        ).toBeVisible()
      );

      const nextStepButton = screen.getByRole('button', {
        name: 'Numeric attributes',
      });

      act(() => {
        nextStepButton.click();
      });

      const sizeButton = screen.getAllByLabelText('Size');

      act(() => {
        sizeButton[1].click();
      });

      const cancelButton = screen.getByRole('button', {
        name: 'Cancel',
      });

      act(() => {
        cancelButton.click();
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('include exclude', () => {
    it('includes alphanumeric attributes', async () => {
      const expectedCall: Action = {
        payload: {
          data: {
            fields: [
              {
                field: 'colour',
                values: ['Blue', 'Red'],
              },
            ],
          },
          change: 'add',
          operation: 'include',
          index: 0,
        },
        type: 'alphanumericIncludeExcludeAttribute',
      };

      await openModal();

      const nextStepButton = screen.getAllByText(
        'Product description attributes'
      )[0];

      act(() => {
        nextStepButton.click();
      });

      const dropdownButton = screen.getAllByText('Boost');

      act(() => {
        dropdownButton[1].click();
      });

      const includeButton = screen.getAllByText('Include only');

      act(() => {
        includeButton[0].click();
      });

      const colourButton = screen.getByRole('button', { name: 'colour' });

      act(() => {
        colourButton.click();
      });

      const colourRedButton = screen.getByLabelText('Red');
      const colourBlueButton = screen.getByLabelText('Blue');

      act(() => {
        colourBlueButton.click();
        colourRedButton.click();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('excludes alphanumeric attributes', async () => {
      const expectedCall: Action = {
        payload: {
          data: {
            fields: [
              {
                field: 'colour',
                values: ['Blue', 'Red'],
              },
            ],
          },
          change: 'add',
          operation: 'exclude',
          index: 0,
        },
        type: 'alphanumericIncludeExcludeAttribute',
      };

      await openModal();

      const nextStepButton = screen.getAllByText(
        'Product description attributes'
      )[0];

      act(() => {
        nextStepButton.click();
      });

      const dropdownButton = screen.getAllByText('Boost');

      act(() => {
        dropdownButton[1].click();
      });

      const includeButton = screen.getAllByText('Exclude only');

      act(() => {
        includeButton[0].click();
      });

      const colourButton = screen.getByRole('button', { name: 'colour' });

      act(() => {
        colourButton.click();
      });

      const colourRedButton = screen.getByLabelText('Red');
      const colourBlueButton = screen.getByLabelText('Blue');

      act(() => {
        colourBlueButton.click();
        colourRedButton.click();
      });

      const doneButton = screen.getByRole('button', { name: 'Done' });

      act(() => {
        doneButton.click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('deletes included attributes', async () => {
      const mock = {
        fields: [
          {
            field: 'category',
            values: ['Accessories', 'Clothing'],
          },
        ],
      };
      const expectedCall: Action = {
        payload: {
          data: mock,
          change: 'remove',
          operation: 'include',
          index: 0,
        },
        type: 'alphanumericIncludeExcludeAttribute',
      };

      renderWithProviders(
        <RulesetAttributes
          countryCode={mockCountryCode}
          merchandisingRules={{
            ...mockRules,
            includes: { alphanumeric: [mock] },
          }}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
          writeEnabled={true}
        />
      );

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[2].click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });

    it('deletes excludes attributes', async () => {
      const mock = {
        fields: [
          {
            field: 'category',
            values: ['Accessories', 'Clothing'],
          },
        ],
      };
      const expectedCall: Action = {
        payload: {
          data: mock,
          change: 'remove',
          operation: 'exclude',
          index: 0,
        },
        type: 'alphanumericIncludeExcludeAttribute',
      };

      renderWithProviders(
        <RulesetAttributes
          countryCode={mockCountryCode}
          merchandisingRules={{
            ...mockRules,
            excludes: { alphanumeric: [mock] },
          }}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
          writeEnabled={true}
        />
      );

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[2].click();
      });

      expect(mockDispatch).toHaveBeenCalledWith(expectedCall);
    });
  });
});
