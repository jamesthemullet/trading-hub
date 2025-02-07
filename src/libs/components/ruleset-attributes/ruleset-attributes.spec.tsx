import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CountryCode, MerchandisingRules } from '@/libs/api';
import { RulesetAttributes } from '@/libs/components/ruleset-attributes/ruleset-attributes';

import { boostMock, buriesMock } from '../../../pages/api/search/mocks';
import { renderWithProviders } from '../../../test/render-with-providers';
import { Action } from '../types';

jest.mock('@/libs/hooks', () => ({
  useAttributes: ({ type }: { type: string }) => {
    if (type === 'alphanumeric') {
      return {
        attributes: [
          {
            type: 'alphanumeric',
            name: 'Colour',
            values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
          },
          {
            type: 'alphanumeric',
            name: 'Brand',
            values: [{ value: 'Nike' }, { value: 'Adidas' }, { value: 'Puma' }],
          },
          {
            type: 'alphanumeric',
            name: 'Category',
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

const mockDispatch = jest.fn();

const mockCountryCode: CountryCode = 'UK';

const mockProps = {
  merchandisingRules: mockRules,
  countryCode: mockCountryCode,
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

    const brandStepButton = screen.getByRole('button', { name: 'Brand' });

    act(() => {
      brandStepButton.click();
    });

    const attributeSelection = screen.getByLabelText('Selected attributes');

    await waitFor(() =>
      expect(within(attributeSelection).getByText('Nike')).toBeVisible()
    );

    const prevStepButton = screen.getAllByText('Brand')[1];

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

    const attributes = screen.getByLabelText('Selected Attribute');

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

    const colourButton = screen.getByRole('button', { name: 'Colour' });

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

    const attributes = screen.getByLabelText('Selected Attribute');

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

    const colourStepButton = screen.getByRole('button', { name: 'Colour' });

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

    const colourButton = screen.getByRole('button', { name: 'Colour' });

    act(() => {
      colourButton.click();
    });

    const colourRedButton = screen.getByLabelText('Red');

    act(() => {
      colourRedButton.click();
    });

    const attributes = screen.getByLabelText('Selected Attribute');

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
      />
    );

    const rulsetAttributes = screen.getByLabelText('Ruleset attributes');

    expect(
      within(rulsetAttributes).getByText('Product Description Attribute Rules')
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

    it('modifies numeric attributes', async () => {
      const user = userEvent.setup();
      const expectedCall: Action = {
        payload: {
          data: { field: 'averageRating', weight: 20 },
          change: 'modify',
          operation: 'boost',
          index: 0,
        },
        type: 'numericAttribute',
      };

      await openModal();

      const editButton = screen.getAllByLabelText(
        'Edit attribute averageRating'
      );

      act(() => {
        editButton[0].click();
      });

      const input = screen.getByLabelText('Edit value');
      await user.type(input, '{Delete}{Delete}{Delete}20');

      const saveButton = screen.getByLabelText(
        'Save attribute averageRating change'
      );

      act(() => {
        saveButton.click();
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
                field: 'Colour',
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

      const colourButton = screen.getByRole('button', { name: 'Colour' });

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

    it('removes alphanumeric attribute value', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        [],
        {
          featureFlags: {
            hasAttributeEdit: true,
          },
        }
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      act(() => {
        screen.getByLabelText('Remove attribute: brand Nike').click();
      });

      act(() => {
        screen.getByLabelText('Save attribute brand change').click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          data: {
            weight: 0.5,
            fields: [
              {
                field: 'brand',
                values: ['Adidas'],
              },
              {
                field: 'category',
                values: ['Shoes', 'Clothing'],
              },
            ],
          },
          change: 'modify',
          operation: 'boost',
          index: 0,
        },
        type: 'alphanumericBoostBuryAttribute',
      });

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[1].click();
      });

      act(() => {
        screen.getByLabelText('Remove attribute: brand Puma').click();
      });

      act(() => {
        screen.getByLabelText('Save attribute brand change').click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          data: {
            weight: 0.7,
            fields: [
              {
                field: 'brand',
                values: ['Reebok'],
              },
              {
                field: 'category',
                values: ['Accessories', 'Clothing'],
              },
            ],
          },
          change: 'modify',
          operation: 'bury',
          index: 0,
        },
        type: 'alphanumericBoostBuryAttribute',
      });
    });

    it('removes alphanumeric attribute if all values are removed', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        [],
        {
          featureFlags: {
            hasAttributeEdit: true,
          },
        }
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      act(() => {
        screen.getByLabelText('Remove attribute: brand Nike').click();
      });
      act(() => {
        screen.getByLabelText('Remove attribute: brand Adidas').click();
      });
      act(() => {
        screen.getByLabelText('Remove attribute: category Shoes').click();
      });
      act(() => {
        screen.getByLabelText('Remove attribute: category Clothing').click();
      });

      act(() => {
        screen.getByLabelText('Save attribute brand change').click();
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        payload: {
          data: mockRules.boosts.alphanumeric[0],
          change: 'remove',
          operation: 'boost',
          index: 0,
        },
        type: 'alphanumericBoostBuryAttribute',
      });
    });

    it('does nothing if changes were canceled', async () => {
      renderWithProviders(
        <RulesetAttributes
          {...mockProps}
          categories={['SubCategory_429']}
          dispatch={mockDispatch}
        />,
        [],
        {
          featureFlags: {
            hasAttributeEdit: true,
          },
        }
      );

      act(() => {
        screen.getAllByLabelText('Edit attribute brand')[0].click();
      });

      act(() => {
        screen.getByLabelText('Remove attribute: brand Nike').click();
      });
      act(() => {
        screen.getByLabelText('Remove attribute: brand Adidas').click();
      });
      act(() => {
        screen.getByLabelText('Remove attribute: category Shoes').click();
      });
      act(() => {
        screen.getByLabelText('Remove attribute: category Clothing').click();
      });

      act(() => {
        screen.getByLabelText('Cancel attribute brand change').click();
      });

      expect(mockDispatch).toHaveBeenCalledTimes(0);
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
                field: 'Colour',
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

      const colourButton = screen.getByRole('button', { name: 'Colour' });

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
                field: 'Colour',
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

      const colourButton = screen.getByRole('button', { name: 'Colour' });

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
