import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { Redirect } from './redirect';

describe('Redirect', () => {
  it('Creates a redriect', async () => {
    const mockCreate = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <Redirect onCancel={() => jest.fn()} onCreate={mockCreate} />
    );

    await act(() => {
      user.type(screen.getByLabelText('Add keyword'), 'new keyword{enter}');
    });

    const redirectUrl = await screen.findByPlaceholderText('c/');

    await act(async () => {
      user.type(redirectUrl, 'c/redirect-url');
    });

    const redirectTitle = await screen.findByPlaceholderText(
      'Enter redirect title'
    );

    await act(async () => {
      user.type(redirectTitle, 'title');
    });

    const toggle = await screen.findAllByLabelText('Redirect Phrase(s)');
    await act(async () => {
      user.click(toggle[0]);
    });

    expect(
      screen.getByRole('heading', { name: 'Add Keyword Redirect rule' })
    ).toBeVisible();

    const saveButton = await screen.findByRole('button', { name: 'Create' });

    await act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith({
      destinationUrl: 'c/redirect-url',
      isEnabled: true,
      keywords: ['new keyword'],
      ruleTitle: 'title',
      type: 'redirectPhrase',
    });
  });
});
