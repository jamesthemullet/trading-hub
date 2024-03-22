import { act, render, screen } from '@testing-library/react';

import { RulesetAttributes } from '@/libs/components';

describe('RulesetAttributes', () => {
  it('should render correctly', () => {
    render(<RulesetAttributes />);

    expect(screen.getByText('Create new attribute rule')).toBeVisible();
  });

  it('opens the modal', () => {
    render(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

    expect(screen.getByText('Choose type')).toBeVisible();
  });

  it('goes to the Numeric Attributes step and back', () => {
    render(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

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

  it('goes to the Product description attributes', () => {
    render(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

    const nextStepButton = screen.getAllByText(
      'Product description attributes'
    )[0];

    act(() => {
      nextStepButton.click();
    });

    expect(
      screen.getByText('Attributes are aggregated from the account level')
    ).toBeVisible();

    const brandStepButton = screen.getByText('brand');

    act(() => {
      brandStepButton.click();
    });

    expect(screen.getByText('Brand name 1')).toBeVisible();

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

  it('cancels changes', () => {
    render(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

    const cancelButton = screen.getByText('Cancel');

    act(() => {
      cancelButton.click();
    });

    expect(screen.getByText('Choose attribute type')).not.toBeVisible();
  });
});
