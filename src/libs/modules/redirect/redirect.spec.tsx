import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReturnedKeywordRedirect } from '@/libs/api';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { renderWithProviders } from '@/test/render-with-providers';

import { Redirect } from './redirect';

describe('Redirect', () => {
  it('creates a redriect', async () => {
    const mockCreate = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <Redirect
        onCancel={() => jest.fn()}
        onCreate={mockCreate}
        title="Add Keyword Redirect rule"
      />
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

  it('saves a redriect', async () => {
    const mockSave = jest.fn();

    const existingRedirect: ReturnedKeywordRedirect = {
      destinationUrl: 'l/womens/dresses',
      type: 'redirectTerm',
      keywords: ['keyword'],
      id: 'abc123',
      lastChanged: {
        date: '',
        user: '',
      },
      isEnabled: true,
    };

    renderWithProviders(
      <Redirect
        onCancel={() => jest.fn()}
        onSave={mockSave}
        title="Edit Keyword Redirect rule"
        redirect={existingRedirect}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Edit Keyword Redirect rule' })
    ).toBeVisible();

    const saveButton = await screen.findByRole('button', { name: 'Save' });

    await act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalledWith({
      destinationUrl: 'l/womens/dresses',
      isEnabled: true,
      keywords: ['keyword'],
      type: 'redirectTerm',
    });
  });

  it('loads a redriect', async () => {
    const mockSave = jest.fn();

    const existingRedirect: ReturnedKeywordRedirect = {
      destinationUrl: 'l/womens/dresses',
      type: 'redirectTerm',
      keywords: ['keyword'],
      id: 'abc123',
      lastChanged: {
        date: '',
        user: '',
      },
      isEnabled: true,
      ruleTitle: 'title of redirect',
    };

    renderWithProviders(
      <Redirect
        onCancel={() => jest.fn()}
        onSave={mockSave}
        title="Edit Keyword Redirect rule"
        redirect={existingRedirect}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Edit Keyword Redirect rule' })
    ).toBeVisible();

    expect(screen.getByDisplayValue('title of redirect')).toBeVisible();
  });

  it('should show datepicker if feature flag is enabled', async () => {
    const mockSave = jest.fn();

    const existingRedirect: ReturnedKeywordRedirect = {
      destinationUrl: 'l/womens/dresses',
      type: 'redirectTerm',
      keywords: ['keyword'],
      id: 'abc123',
      lastChanged: {
        date: '',
        user: '',
      },
      isEnabled: true,
      ruleTitle: 'title of redirect',
    };

    renderWithProviders(
      <FeatureFlagContext.Provider value={{ hasScheduling: true }}>
        <Redirect
          onCancel={() => jest.fn()}
          onSave={mockSave}
          title="Edit Keyword Redirect rule"
          redirect={existingRedirect}
        />
      </FeatureFlagContext.Provider>
    );

    expect(screen.getByText('Duration')).toBeVisible();
  });
});
