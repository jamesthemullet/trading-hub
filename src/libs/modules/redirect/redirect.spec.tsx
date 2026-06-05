import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { MerchandisingReturnedKeywordRedirect } from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import { Redirect } from './redirect';

describe('Redirect', () => {
  it('creates a redirect', async () => {
    const user = userEvent.setup({ delay: null });
    const mockCreate = jest.fn();

    renderWithProviders(
      <Redirect
        isWriteEnabled
        onCancel={() => jest.fn()}
        onCreate={mockCreate}
        title="Add Keyword Redirect rule"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await waitFor(async () => {
      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );
    });

    await user.click(screen.getByRole('button', { name: 'Close' }));

    const redirectUrl = await screen.findByPlaceholderText('c/');

    await waitFor(async () => {
      await user.type(redirectUrl, 'c/redirect-url');
    });

    const redirectTitle = await screen.findByPlaceholderText(
      'Enter redirect title'
    );

    await waitFor(async () => {
      await user.type(redirectTitle, 'title');
    });

    const toggle = await screen.findAllByLabelText('Redirect Phrase(s)');
    await user.click(toggle[0]);

    const saveButton = await screen.findByRole('button', { name: 'Create' });

    expect(saveButton).toBeEnabled();

    await waitFor(async () => {
      await user.click(saveButton);
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
      <Redirect
        isWriteEnabled
        onCancel={() => jest.fn()}
        onCreate={mockCreate}
        title="Add Keyword Redirect rule"
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await user.type(
      screen.getByLabelText('Add keyword to list'),
      'new keyword{enter}'
    );

    await user.click(screen.getByRole('button', { name: 'Close' }));

    const redirectUrl = await screen.findByPlaceholderText('c/');

    await user.type(redirectUrl, 'c/redirect-url');

    const redirectTitle = await screen.findByPlaceholderText(
      'Enter redirect title'
    );

    await user.type(redirectTitle, 'title');

    const dropdownButton = screen.getByRole('button', {
      name: /^Select country/i,
    });

    await user.click(dropdownButton);

    const selectIE = screen.getByRole('menuitemradio', {
      name: 'IE market only',
    });

    await user.click(selectIE);

    const saveButton = await screen.findByRole('button', { name: 'Create' });

    await user.click(saveButton);

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

    const existingRedirect: MerchandisingReturnedKeywordRedirect = {
      destinationUrl: 'l/womens/dresses',
      type: 'redirectTerm',
      keywords: ['new keyword'],
      id: 'abc123',
      lastChanged: {
        date: '',
        user: '',
      },
      isEnabled: true,
    };
    renderWithProviders(
      <Redirect
        isWriteEnabled
        onCancel={() => jest.fn()}
        onCreate={mockCreate}
        title="Add Keyword Redirect rule"
        redirect={existingRedirect}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await user.type(
      screen.getByLabelText('Add keyword to list'),
      'new keyword{enter}'
    );

    await waitFor(async () => {
      expect(
        screen.getByText('Keyword new keyword has already been added')
      ).toBeVisible();
    });
  });

  it('saves a redirect', async () => {
    const user = userEvent.setup({ delay: null });
    const mockSave = jest.fn();

    const existingRedirect: MerchandisingReturnedKeywordRedirect = {
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
        isWriteEnabled
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

    await user.click(saveButton);

    expect(mockSave).toHaveBeenCalledWith({
      destinationUrl: 'l/womens/dresses',
      isEnabled: true,
      keywords: ['keyword'],
      type: 'redirectTerm',
    });
  });

  it('loads a redirect', async () => {
    const mockSave = jest.fn();

    const existingRedirect: MerchandisingReturnedKeywordRedirect = {
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
        isWriteEnabled
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
    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2022, 2, 1));
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it('should show datepicker', async () => {
      const mockSave = jest.fn();

      const existingRedirect: MerchandisingReturnedKeywordRedirect = {
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
        <Redirect
          isWriteEnabled
          onCancel={() => jest.fn()}
          onSave={mockSave}
          title="Edit Keyword Redirect rule"
          redirect={existingRedirect}
        />
      );

      expect(screen.getByText('Duration')).toBeVisible();
    });

    it('should not show the date if no start date or end date', async () => {
      const mockSave = jest.fn();

      const existingRedirect: MerchandisingReturnedKeywordRedirect = {
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
        <Redirect
          isWriteEnabled
          onCancel={() => jest.fn()}
          onSave={mockSave}
          title="Edit Keyword Redirect rule"
          redirect={existingRedirect}
        />
      );

      expect(screen.getByText('Duration')).toBeVisible();
      expect(screen.getByPlaceholderText('Select date range')).toHaveValue('');
    });

    it('should add a date range', async () => {
      const mockSave = jest.fn();

      const existingRedirect: MerchandisingReturnedKeywordRedirect = {
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
        <Redirect
          isWriteEnabled
          onCancel={() => jest.fn()}
          onSave={mockSave}
          title="Edit Keyword Redirect rule"
          redirect={existingRedirect}
        />
      );

      expect(screen.getByText('Duration')).toBeVisible();

      const input = screen.getByPlaceholderText('Select date range');
      act(() => {
        input.click();
      });

      await waitFor(() => {
        expect(screen.getByText('On all the time')).toBeVisible();
      });

      const toggle = screen.getByTitle('Toggle');
      act(() => {
        toggle.click();
      });

      const startDate = screen.getAllByText('16')[1];
      const endDate = screen.getAllByText('17')[1];

      // mantine update auto selects the current day so we need to click the start date twice
      act(() => {
        startDate.click();
      });
      act(() => {
        startDate.click();
      });

      act(() => {
        endDate.click();
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

      const existingRedirect: MerchandisingReturnedKeywordRedirect = {
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
        <Redirect
          isWriteEnabled
          onCancel={() => jest.fn()}
          onSave={mockSave}
          title="Edit Keyword Redirect rule"
          redirect={existingRedirect}
        />
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
