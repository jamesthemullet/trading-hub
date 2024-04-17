import { act, screen, waitFor, within } from '@testing-library/react';

import { RulesetAttributes } from '@/libs/components';
import { renderWithProviders } from '../../../test/render-with-providers';
import userEvent from '@testing-library/user-event';
import { boostMock, buriesMock } from '../../../pages/api/merchandising/mocks';
import { MerchandisingRules } from '@/libs/api';

jest.mock('@/libs/hooks', () => ({
  useAttributes: () => ({
    attributes: [
      {
        type: 'alphanumeric',
        name: 'Colour',
        values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
      },
      {
        type: 'numeric',
        name: 'Size',
        values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
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
  }),
}));

const mockRules: MerchandisingRules = {
  pinnedProducts: [],
  boosts: boostMock,
  buries: buriesMock,
  blockedProducts: [],
};

const mockAddAttribute = jest.fn();

describe('RulesetAttributes', () => {
  const openModal = async () => {
    renderWithProviders(
      <RulesetAttributes
        merchandisingRules={mockRules}
        category="TestCategory"
        onChangeAttribute={mockAddAttribute}
      />
    );

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

    await waitFor(() =>
      expect(screen.getByText('Choose attribute type')).toBeVisible()
    );
  };

  it('should render correctly', () => {
    renderWithProviders(
      <RulesetAttributes
        onChangeAttribute={jest.fn()}
        merchandisingRules={mockRules}
      />
    );

    expect(screen.getByText('Create new attribute rule')).toBeVisible();
  });

  it('opens the modal', async () => {
    await openModal();

    expect(screen.getByText('Choose type')).toBeVisible();
  });

  it('goes to the Numeric Attributes step and back', async () => {
    await openModal();

    expect(screen.getByText('Numeric attributes')).toBeVisible();

    const nextStepButton = screen.getByText('Numeric attributes');

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

    expect(screen.getByText('Choose attribute type')).toBeVisible();
  });

  it('goes to the Product description attributes', async () => {
    openModal();

    await waitFor(() =>
      expect(screen.getByText('Numeric attributes')).toBeVisible()
    );

    const nextStepButton = screen.getAllByText(
      'Product description attributes'
    )[0];

    act(() => {
      nextStepButton.click();
    });

    expect(
      screen.getByText('Attributes are aggregated from the account level')
    ).toBeVisible();

    const brandStepButton = screen.getByText('Brand');

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
      screen.getByText('Attributes are aggregated from the account level')
    ).toBeVisible();

    const firstStepButton = screen.getAllByText('Back')[1];

    act(() => {
      firstStepButton.click();
    });

    expect(screen.getByText('Choose attribute type')).toBeVisible();
  });

  it('cancels changes', async () => {
    await openModal();

    const cancelButton = screen.getByText('Cancel');

    act(() => {
      cancelButton.click();
    });
    await waitFor(() =>
      expect(screen.getByText('Choose attribute type')).not.toBeVisible()
    );
  });

  it('selects a numeric attribute', async () => {
    await openModal();

    const nextStepButton = screen.getByText('Numeric attributes');

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

    const nextStepButton = screen.getByText('Numeric attributes');

    act(() => {
      nextStepButton.click();
    });

    await user.type(screen.getByLabelText('Filter numeric attributes'), 'Size');

    expect(screen.queryByText('Price')).toBeNull();
  });

  it('selects Product description attributes', async () => {
    await openModal();

    const nextStepButton = screen.getAllByText(
      'Product description attributes'
    )[0];

    act(() => {
      nextStepButton.click();
    });

    const colourButton = screen.getByText('Colour');

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

    expect(screen.queryByText('Brand')).toBeNull();

    const colourStepButton = screen.getByText('Colour');

    act(() => {
      colourStepButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Red')).toBeVisible();
      expect(screen.getByText('Blue')).toBeVisible();
      expect(screen.getByText('Green')).toBeVisible();
    });

    await user.type(screen.getByLabelText('Filter selected attributes'), 'Red');

    expect(screen.queryByText('Blue')).toBeNull();
  });

  it('buries Product description attributes', async () => {
    await openModal();

    const nextStepButton = screen.getAllByText(
      'Product description attributes'
    )[0];

    act(() => {
      nextStepButton.click();
    });

    const dropdownButton = screen.getAllByText('boost');

    act(() => {
      dropdownButton[1].click();
    });

    const buryButton = screen.getAllByText('Bury');

    act(() => {
      buryButton[1].click();
    });

    const colourButton = screen.getByText('Colour');

    act(() => {
      colourButton.click();
    });

    const colourRedButton = screen.getByLabelText('Red');

    act(() => {
      colourRedButton.click();
    });

    const attributes = screen.getByLabelText('Selected Attribute');

    await waitFor(() =>
      expect(within(attributes).getByText('Operation bury')).toBeVisible()
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
    };

    renderWithProviders(
      <RulesetAttributes
        onChangeAttribute={jest.fn()}
        merchandisingRules={merchandisingRules}
      />
    );

    const rulsetAttributes = screen.getByLabelText('Ruleset attributes');

    expect(
      within(rulsetAttributes).getByText('Product Description Attribute Rules')
    ).toBeVisible();
  });

  describe('adding and deleting', () => {
    it('adds numeric attributes', async () => {
      const expectedCall = {
        attribute: { field: 'Size', weight: 0.01 },
        change: 'add',
        operation: 'boosts',
        type: 'numeric',
      };

      await openModal();

      const nextStepButton = screen.getByText('Numeric attributes');

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

      expect(mockAddAttribute).toHaveBeenCalledWith(expectedCall);
    });

    it('deletes numeric attributes', async () => {
      const expectedCall1 = {
        attribute: mockRules.boosts.numeric[1],
        change: 'remove',
        operation: 'boosts',
        type: 'numeric',
      };
      const expectedCall2 = {
        attribute: mockRules.buries.numeric[0],
        change: 'remove',
        operation: 'buries',
        type: 'numeric',
      };

      renderWithProviders(
        <RulesetAttributes
          merchandisingRules={mockRules}
          category="TestCategory"
          onChangeAttribute={mockAddAttribute}
        />
      );

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[3].click();
      });

      expect(mockAddAttribute).toHaveBeenCalledWith(expectedCall1);

      act(() => {
        deleteButton[4].click();
      });

      expect(mockAddAttribute).toHaveBeenLastCalledWith(expectedCall2);
    });

    it('adds alphanumeric attributes', async () => {
      const expectedCall = {
        attribute: {
          fields: [
            {
              field: 'Colour',
              values: ['Blue', 'Red'],
            },
          ],
          weight: 0.01,
        },
        change: 'add',
        operation: 'boosts',
        type: 'alphanumeric',
      };

      await openModal();

      const nextStepButton = screen.getAllByText(
        'Product description attributes'
      )[0];

      act(() => {
        nextStepButton.click();
      });

      const colourButton = screen.getByText('Colour');

      act(() => {
        colourButton.click();
      });

      const colourRedButton = screen.getByLabelText('Red');
      const colourBlueButton = screen.getByLabelText('Blue');

      act(() => {
        colourBlueButton.click();
        colourRedButton.click();
      });

      const doneButton = screen.getByText('Done');

      act(() => {
        doneButton.click();
      });

      expect(mockAddAttribute).toHaveBeenCalledWith(expectedCall);
    });

    it('deletes alphanumeric attributes', async () => {
      const expectedCall1 = {
        attribute: mockRules.boosts.alphanumeric[0],
        change: 'remove',
        operation: 'boosts',
        type: 'alphanumeric',
      };
      const expectedCall2 = {
        attribute: mockRules.buries.alphanumeric[0],
        change: 'remove',
        operation: 'buries',
        type: 'alphanumeric',
      };

      renderWithProviders(
        <RulesetAttributes
          merchandisingRules={mockRules}
          category="TestCategory"
          onChangeAttribute={mockAddAttribute}
        />
      );

      const deleteButton = screen.getAllByLabelText('Delete attribute');

      act(() => {
        deleteButton[0].click();
      });

      expect(mockAddAttribute).toHaveBeenCalledWith(expectedCall1);

      act(() => {
        deleteButton[1].click();
      });

      expect(mockAddAttribute).toHaveBeenCalledWith(expectedCall2);
    });
  });
});
