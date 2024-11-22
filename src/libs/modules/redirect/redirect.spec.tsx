import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReturnedKeywordRedirect } from '@/libs/api';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { renderWithProviders } from '@/test/render-with-providers';

import { Redirect } from './redirect';

describe('Redirect', () => {
  it('creates a redirect', async () => {
    const mockCreate = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <Redirect
        onCancel={() => jest.fn()}
        onCreate={mockCreate}
        title="Add Keyword Redirect rule"
      />
    );

    act(() => {
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

    act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith({
      destinationUrl: 'c/redirect-url',
      endDate: '',
      isEnabled: true,
      keywords: ['new keyword'],
      ruleTitle: 'title',
      startDate: '',
      type: 'redirectPhrase',
      countryCode: 'UK_IE',
    });
  });

  it('should create a redirect with the country code selected in the dropdown', async () => {
    const mockCreate = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <FeatureFlagContext.Provider
        value={{ hasIreland: true, hasMultipleCategories: false }}
      >
        <Redirect
          onCancel={() => jest.fn()}
          onCreate={mockCreate}
          title="Add Keyword Redirect rule"
        />
      </FeatureFlagContext.Provider>
    );

    act(() => {
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

    const dropdownButton = screen.getByRole('button', {
      name: 'select market',
    });

    await user.click(dropdownButton);

    const selectIE = screen.getByLabelText('select IE market only');

    await user.click(selectIE);

    const saveButton = await screen.findByRole('button', { name: 'Create' });

    act(() => {
      saveButton.click();
    });

    expect(mockCreate).toHaveBeenCalledWith({
      destinationUrl: 'c/redirect-url',
      endDate: '',
      isEnabled: true,
      keywords: ['new keyword'],
      ruleTitle: 'title',
      startDate: '',
      type: 'redirectTerm',
      countryCode: 'IE',
    });
  });

  it('should show error and not add keyword to the list if there are duplicate keywords', async () => {
    const mockCreate = jest.fn();
    const user = userEvent.setup({ delay: null });

    renderWithProviders(
      <Redirect
        onCancel={() => jest.fn()}
        onCreate={mockCreate}
        title="Add Keyword Redirect rule"
      />
    );

    await act(async () => {
      user.type(screen.getByLabelText('Add keyword'), 'new keyword{enter}');
    });

    await act(async () => {
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

    expect(
      screen.getByText('Keyword new keyword has already been added')
    ).toBeVisible();

    expect(
      screen.queryAllByRole('button', { name: 'Remove keyword: new keyword' })
    ).toHaveLength(1);
  });

  it('saves a redirect', async () => {
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

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalledWith({
      destinationUrl: 'l/womens/dresses',
      isEnabled: true,
      keywords: ['keyword'],
      type: 'redirectTerm',
    });
  });

  it('loads a redirect', async () => {
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

  describe('Scheduling', () => {
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
        startDate: '2024-09-12T14:17:54Z',
        endDate: '2024-12-19T04:20:03Z',
      };

      renderWithProviders(
        <FeatureFlagContext.Provider
          value={{ hasIreland: false, hasMultipleCategories: false }}
        >
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

    it('should not show the date if no start date or end date', async () => {
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
        startDate: '',
        endDate: '',
      };

      renderWithProviders(
        <FeatureFlagContext.Provider
          value={{ hasIreland: false, hasMultipleCategories: false }}
        >
          <Redirect
            onCancel={() => jest.fn()}
            onSave={mockSave}
            title="Edit Keyword Redirect rule"
            redirect={existingRedirect}
          />
        </FeatureFlagContext.Provider>
      );

      expect(screen.getByText('Duration')).toBeVisible();
      expect(screen.getByPlaceholderText('Select date range')).toHaveValue('');
    });

    it('should add a date range', async () => {
      const user = userEvent.setup({ delay: null });
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
        startDate: '',
        endDate: '',
      };

      renderWithProviders(
        <FeatureFlagContext.Provider
          value={{ hasIreland: false, hasMultipleCategories: false }}
        >
          <Redirect
            onCancel={() => jest.fn()}
            onSave={mockSave}
            title="Edit Keyword Redirect rule"
            redirect={existingRedirect}
          />
        </FeatureFlagContext.Provider>
      );

      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      await user.click(screen.getByTitle('Toggle'));

      await waitFor(() => {
        const startDate = screen.getAllByText('16')[1];
        act(() => {
          startDate.click();
        });
      });

      await waitFor(() => {
        const endDate = screen.getAllByText('17')[1];
        act(() => {
          endDate.click();
        });
      });

      const saveButton = screen.getByRole('button', {
        name: 'Close schedule editor',
      });
      expect(saveButton).toBeEnabled();
      act(() => {
        saveButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByText('On all the time')).not.toBeInTheDocument();
      });
    });

    it('should remove a date range', async () => {
      const user = userEvent.setup({ delay: null });
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
        startDate: '2024-03-12T14:17:54Z',
        endDate: '2024-06-19T04:20:03Z',
      };

      renderWithProviders(
        <FeatureFlagContext.Provider
          value={{ hasIreland: false, hasMultipleCategories: false }}
        >
          <Redirect
            onCancel={() => jest.fn()}
            onSave={mockSave}
            title="Edit Keyword Redirect rule"
            redirect={existingRedirect}
          />
        </FeatureFlagContext.Provider>
      );

      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      await user.click(screen.getByTitle('Toggle'));

      const saveButton = screen.getByRole('button', {
        name: 'Close schedule editor',
      });
      expect(saveButton).toBeEnabled();
      act(() => {
        saveButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByText('On all the time')).not.toBeInTheDocument();
      });
    });
  });
});
