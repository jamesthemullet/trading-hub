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

  it('goes to the next step', () => {
    render(<RulesetAttributes />);

    const newAttributeButton = screen.getByText('Create new attribute rule');

    act(() => {
      newAttributeButton.click();
    });

    const nextStepButton = screen.getByText('demo next view');

    act(() => {
      nextStepButton.click();
    });

    expect(screen.getByText('Step 2 content')).toBeVisible();

    const prevStepButton = screen.getByText('demo previous view');

    act(() => {
      prevStepButton.click();
    });

    expect(screen.getByText('Step 1 content')).toBeVisible();
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

    expect(screen.getByText('Step 1 content')).not.toBeVisible();
  });
});
