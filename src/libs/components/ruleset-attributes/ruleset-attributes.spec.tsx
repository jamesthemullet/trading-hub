import { act, screen, waitFor, within } from '@testing-library/react';

import { RulesetAttributes } from '@/libs/components';
import { renderWithProviders } from '../../../test/render-with-providers';
import userEvent from '@testing-library/user-event';

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

describe('RulesetAttributes', () => {
  const openModal = () => {
    renderWithProviders(<RulesetAttributes category="TestCategory" />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });
  };

  it('should render correctly', () => {
    renderWithProviders(<RulesetAttributes />);

    expect(screen.getByText('Create new attribute rule')).toBeVisible();
  });

  it('opens the modal', async () => {
    openModal();

    await waitFor(() => expect(screen.getByText('Choose type')).toBeVisible());
  });

  it('goes to the Numeric Attributes step and back', async () => {
    openModal();

    await waitFor(() =>
      expect(screen.getByText('Numeric attributes')).toBeVisible()
    );

    const nextStepButton = screen.getByText('Numeric attributes');

    act(() => {
      nextStepButton.click();
    });

    expect(
      screen.getByText(/Select one numeric attribute below/i)
    ).toBeVisible();

    const prevStepButton = screen.getAllByText('back')[0];

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

    expect(screen.getByText('Nike')).toBeVisible();

    const prevStepButton = screen.getAllByText('back')[2];

    act(() => {
      prevStepButton.click();
    });

    expect(
      screen.getByText('Attributes are aggregated from the account level')
    ).toBeVisible();

    const firstStepButton = screen.getAllByText('back')[1];

    act(() => {
      firstStepButton.click();
    });

    expect(screen.getByText('Choose attribute type')).toBeVisible();
  });

  it('cancels changes', async () => {
    openModal();

    await waitFor(() =>
      expect(screen.getByText('Numeric attributes')).toBeVisible()
    );

    const cancelButton = screen.getByText('Cancel');

    act(() => {
      cancelButton.click();
    });
    await waitFor(() =>
      expect(screen.getByText('Choose attribute type')).not.toBeVisible()
    );
  });

  it('selects a numeric attribute', async () => {
    openModal();

    await waitFor(() =>
      expect(screen.getByText('Numeric attributes')).toBeVisible()
    );

    const nextStepButton = screen.getByText('Numeric attributes');

    act(() => {
      nextStepButton.click();
    });

    const sizeButton = screen.getAllByLabelText('Size');

    act(() => {
      sizeButton[0].click();
    });

    const attributes = await screen.getByLabelText('Selected Attribute');

    await waitFor(() =>
      expect(within(attributes).getByText('Size')).toBeVisible()
    );
  });

  it('filters a numeric attribute', async () => {
    const user = userEvent.setup();
    openModal();

    await waitFor(() =>
      expect(screen.getByText('Numeric attributes')).toBeVisible()
    );

    const nextStepButton = screen.getByText('Numeric attributes');

    act(() => {
      nextStepButton.click();
    });

    await user.type(screen.getByLabelText('Filter numeric attributes'), 'Size');

    expect(screen.queryByText('Price')).toBeNull();
  });

  it('selects Product description attributes', async () => {
    openModal();

    await waitFor(() =>
      expect(
        screen.getByText('Attributes are aggregated from the account level')
      ).toBeVisible()
    );

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

    const attributes = await screen.getByLabelText('Selected Attribute');

    await waitFor(() =>
      expect(within(attributes).getByText('Blue')).toBeVisible()
    );
  });

  it('filters Product description attributes', async () => {
    const user = userEvent.setup();
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
});
