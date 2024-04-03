import { act, render, screen } from '@testing-library/react';
import { AttributeWeight } from './weight';
import userEvent from '@testing-library/user-event';

describe('AttributeWeight', () => {
  it('shows the attribute weight', () => {
    render(<AttributeWeight weight={1} />);

    expect(screen.getByText('Strength 100.0%')).toBeInTheDocument();
  });

  it('edits the attribute weight', async () => {
    const user = userEvent.setup();
    render(<AttributeWeight weight={1} isEditable />);

    const editButton = screen.getByLabelText('Edit weight');

    act(() => {
      editButton.click();
    });

    const input = screen.getByLabelText('Edit value');
    await user.type(input, '{Delete}{Delete}{Delete}20');

    const saveButton = screen.getByLabelText('Save weight change');

    act(() => {
      saveButton.click();
    });

    expect(screen.getByText('Strength 20.0%')).toBeInTheDocument();
  });

  it('clears the attribute weight', async () => {
    const user = userEvent.setup();
    render(<AttributeWeight weight={1} isEditable />);

    const editButton = screen.getByLabelText('Edit weight');

    act(() => {
      editButton.click();
    });

    const input = screen.getByLabelText('Edit value');
    await user.type(input, '{Delete}{Delete}{Delete}{Delete}');

    const saveButton = screen.getByLabelText('Save weight change');

    act(() => {
      saveButton.click();
    });

    expect(screen.getByText('Strength 0%')).toBeInTheDocument();
  });
});
