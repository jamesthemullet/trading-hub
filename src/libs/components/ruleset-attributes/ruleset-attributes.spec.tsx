import { act, screen, waitFor } from '@testing-library/react';

import { RulesetAttributes } from '@/libs/components';
import { renderWithProviders } from '../../../test/render-with-providers';

jest.mock('@/libs/hooks', () => ({
  useAttributes: () => ({
    attributes: [
      {
        type: 'alphanumeric',
        name: 'Color',
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
  it('should render correctly', () => {
    renderWithProviders(<RulesetAttributes />);

    expect(screen.getByText('Create new attribute rule')).toBeVisible();
  });

  it('opens the modal', async () => {
    renderWithProviders(<RulesetAttributes category="TestCategory" />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

    await waitFor(() => expect(screen.getByText('Choose type')).toBeVisible());
  });

  it('goes to the Numeric Attributes step and back', async () => {
    renderWithProviders(<RulesetAttributes category="TestCategory" />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

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
    renderWithProviders(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });
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
    renderWithProviders(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });
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
});
