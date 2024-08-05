import { act } from 'react-dom/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { SearchKeywords } from './search-keywords';

const shorterSearchTermsList = ['keyword1', 'keyword2', 'keyword3'];

const longerSearchTermsList = [
  'keyword1',
  'keyword2',
  'keyword3',
  'keyword4',
  'keyword5',
  'keyword6',
  'very long keyword to take it over the 60 character limit',
];

describe('Search Keywords', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={shorterSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={() => {}}
      />
    );

    expect(screen.getByText('Search Keywords')).toBeInTheDocument();
    expect(screen.getByText('keyword1')).toBeVisible();
    expect(screen.getByText('keyword2')).toBeVisible();
    expect(screen.getByText('keyword3')).toBeVisible();
    expect(screen.queryByText('keyword4')).not.toBeInTheDocument();
  });

  it('should add a new keyword to the list without the modal being open', async () => {
    const addSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={shorterSearchTermsList}
        addSearchTerm={addSearchTermStub}
        removeSearchTerm={() => {}}
      />
    );

    await waitFor(() => {
      userEvent.type(
        screen.getByLabelText('Add keyword'),
        'new keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermStub).toHaveBeenCalledWith('new keyword');
    });
  });

  it('should remove a keyword from the list without the modal being open', async () => {
    const removeSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={shorterSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={removeSearchTermStub}
      />
    );

    await waitFor(() => {
      userEvent.click(screen.getByLabelText('Remove keyword: keyword2'));
    });

    await waitFor(() => {
      expect(removeSearchTermStub).toHaveBeenCalledWith('keyword2');
    });
  });

  it('should add a new keyword to the list with the modal being open', async () => {
    const addSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={longerSearchTermsList}
        addSearchTerm={addSearchTermStub}
        removeSearchTerm={() => {}}
      />
    );

    await waitFor(() => {
      userEvent.click(screen.getByLabelText('View all'));
    });

    await waitFor(() => {
      userEvent.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermStub).toHaveBeenCalledWith('new keyword');
    });
  });

  it('should remove a keyword from the list on the modal', async () => {
    const removeSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={longerSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={removeSearchTermStub}
      />
    );

    await waitFor(() => {
      userEvent.click(screen.getByLabelText('View all'));
      userEvent.click(screen.getByLabelText('Remove keyword: keyword5'));
    });

    await waitFor(() => {
      expect(removeSearchTermStub).toHaveBeenCalledWith('keyword5');
    });
  });

  it('should not show the view all button when there are less keywords than the max to display', () => {
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={shorterSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={() => {}}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'View all' })
    ).not.toBeInTheDocument();
  });

  it('should show the view all button when there are more keywords than the max to display', () => {
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={longerSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: 'View all' })).toBeVisible();
  });

  it('should close the modal', async () => {
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={longerSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={() => {}}
      />
    );

    await waitFor(() => {
      userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Close keywords modal' })
      ).toBeVisible();
    });

    await waitFor(() => {
      userEvent.click(
        screen.getByRole('button', { name: 'Close keywords modal' })
      );
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close keywords modal' })
      ).not.toBeInTheDocument();
    });
  });

  it('should not close the modal if the user tries to close it with an unfinished keyword', async () => {
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={longerSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={() => {}}
      />
    );

    await waitFor(() => {
      userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(() => {
      userEvent.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword'
      );
    });

    await waitFor(() => {
      userEvent.click(
        screen.getByRole('button', { name: 'Close keywords modal' })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText('Please finish adding the keyword to close')
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Close keywords modal' })
      ).toBeVisible();
    });
  });

  it('should filter attributes on user input', async () => {
    renderWithProviders(
      <SearchKeywords
        title="Search Keywords"
        searchTerms={longerSearchTermsList}
        addSearchTerm={() => {}}
        removeSearchTerm={() => {}}
      />
    );

    act(() => {
      userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(() => {
      userEvent.type(screen.getByPlaceholderText('Search...'), 'keyword1');
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Remove keyword: keyword1')).toBeVisible();
      expect(
        screen.queryByText('Remove keyword: keyword2')
      ).not.toBeInTheDocument();
    });
  });
});
