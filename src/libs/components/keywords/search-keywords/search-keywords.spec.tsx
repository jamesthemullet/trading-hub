import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import type { Props } from './search-keywords';
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

const mockProps: Props = {
  title: 'Search Keywords',
  searchTerms: [],
  addSearchTerm: jest.fn(),
  removeSearchTerm: jest.fn(),
  previewSearchTerm: undefined,
  selectPreviewSearchTerm: jest.fn(),
  writeEnabled: true,
};

describe('Search Keywords', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={shorterSearchTermsList} />
    );

    expect(screen.getByText('Search Keywords')).toBeInTheDocument();
    expect(screen.getByText('keyword1')).toBeVisible();
    expect(screen.getByText('keyword2')).toBeVisible();
    expect(screen.getByText('keyword3')).toBeVisible();
    expect(screen.queryByText('keyword4')).not.toBeInTheDocument();
  });

  it('should not be editable in read only mode', () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        writeEnabled={false}
      />
    );

    expect(screen.queryByLabelText('Add keyword')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Remove keyword: keyword1')
    ).not.toBeInTheDocument();
  });

  it('should add a new keyword to the list without the modal being open', async () => {
    const addSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        addSearchTerm={addSearchTermStub}
      />
    );

    await waitFor(async () => {
      await userEvent.type(
        screen.getByLabelText('Add keyword'),
        'new keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermStub).toHaveBeenCalledWith('new keyword');
    });
  });

  it('should add a new keyword in lower case if prop is provided', async () => {
    const addSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        addSearchTerm={addSearchTermStub}
      />
    );

    await waitFor(async () => {
      await userEvent.type(
        screen.getByLabelText('Add keyword'),
        'NEW keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermStub).toHaveBeenCalledWith('new keyword');
    });
  });

  it('should add a new keyword to the list after typing and clicking elsewhere', async () => {
    const addSearchTermStub = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <SearchKeywords {...mockProps} addSearchTerm={addSearchTermStub} />
    );

    const input = screen.getByLabelText('Add keyword');

    act(() => {
      user.type(input, 'new keyword');
    });

    await waitFor(() => {
      expect(screen.getAllByDisplayValue('new keyword')).toHaveLength(1);
    });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(addSearchTermStub).toHaveBeenCalledWith('new keyword');
    });
  });

  it('should remove a keyword from the list without the modal being open', async () => {
    const removeSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        removeSearchTerm={removeSearchTermStub}
      />
    );

    await waitFor(async () => {
      await userEvent.click(screen.getByLabelText('Remove keyword: keyword2'));
    });

    await waitFor(() => {
      expect(removeSearchTermStub).toHaveBeenCalledWith('keyword2');
    });
  });

  it('should add a new keyword to the list with the modal being open', async () => {
    const addSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        addSearchTerm={addSearchTermStub}
        selectPreviewSearchTerm={undefined}
      />
    );

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(async () => {
      await userEvent.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermStub).toHaveBeenCalledWith('new keyword');
    });
  });

  it('should add a new keyword in lowercase to the list with the modal being open', async () => {
    const addSearchTermStub = jest.fn();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        addSearchTerm={addSearchTermStub}
        selectPreviewSearchTerm={undefined}
      />
    );

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(async () => {
      await userEvent.type(
        screen.getByLabelText('Add keyword to list'),
        'NEW keyword{enter}'
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
        {...mockProps}
        searchTerms={longerSearchTermsList}
        removeSearchTerm={removeSearchTermStub}
      />
    );
    const modal = await screen.findByLabelText('Search Keywords Modal');
    expect(modal).toBeVisible();

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View all' }));
      await userEvent.click(
        within(modal).getByLabelText('Remove keyword: keyword5')
      );
    });

    await waitFor(() => {
      expect(removeSearchTermStub).toHaveBeenCalledWith('keyword5');
    });
  });

  it('should not show the view all button when there are less keywords than the max to display', () => {
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={shorterSearchTermsList} />
    );

    expect(
      screen.queryByRole('button', { name: 'View all' })
    ).not.toBeInTheDocument();
  });

  it('should show the view all button when there are more keywords than the max to display', () => {
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    expect(screen.getByRole('button', { name: 'View all' })).toBeVisible();
  });

  it('should close the modal', async () => {
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close' })
      ).not.toBeInTheDocument();
    });
  });

  it('should not close the modal if the user tries to close it with an unfinished keyword', async () => {
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'View all' }));
    });

    await waitFor(async () => {
      await userEvent.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword'
      );
    });

    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    });

    await waitFor(() => {
      expect(
        screen.getByText('Please finish adding the keyword to close')
      ).toBeVisible();
    });

    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('should filter attributes on user input', async () => {
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    await userEvent.click(screen.getByRole('button', { name: 'View all' }));

    const modal = await screen.findByLabelText('Search Keywords Modal');
    expect(modal).toBeVisible();

    await waitFor(async () => {
      await userEvent.type(
        within(modal).getByPlaceholderText('Search...'),
        'keyword1'
      );
    });

    await waitFor(() => {
      expect(
        within(modal).getByLabelText('Remove keyword: keyword1')
      ).toBeVisible();
    });

    expect(
      within(modal).queryByText('Remove keyword: keyword2')
    ).not.toBeInTheDocument();
  });

  it('should change the preview keyword', async () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    const keyword2 = await screen.findByRole('button', {
      name: shorterSearchTermsList[1],
    });

    act(() => {
      keyword2.click();
    });

    expect(mockProps.selectPreviewSearchTerm).toHaveBeenCalledWith(
      shorterSearchTermsList[1]
    );
  });

  it('should show the preview keyword first in the list', async () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        previewSearchTerm={longerSearchTermsList[5]}
      />
    );

    const keywords = screen.getAllByLabelText('Remove keyword: ', {
      exact: false,
    });

    expect(keywords[0]).toHaveAttribute(
      'aria-label',
      `Remove keyword: ${longerSearchTermsList[5]}`
    );
  });

  it('should select an additional keyword as the preview keyword if the preview keyword is removed', async () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    const keyword1remove = await screen.findAllByRole('button', {
      name: `Remove keyword: ${shorterSearchTermsList[0]}`,
    });

    act(() => {
      keyword1remove[0].click();
    });

    expect(mockProps.removeSearchTerm).toHaveBeenCalledWith(
      shorterSearchTermsList[0]
    );
    expect(mockProps.selectPreviewSearchTerm).toHaveBeenCalledWith(
      shorterSearchTermsList[1]
    );
  });

  it('should clear the preview keyword if the preview keyword is removed and no other keywords have been selected', async () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList.slice(0, 1)}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    const keyword1remove = await screen.findAllByRole('button', {
      name: `Remove keyword: ${shorterSearchTermsList[0]}`,
    });

    act(() => {
      keyword1remove[0].click();
    });

    expect(mockProps.removeSearchTerm).toHaveBeenCalledWith(
      shorterSearchTermsList[0]
    );
    expect(mockProps.selectPreviewSearchTerm).toHaveBeenCalledWith(undefined);
  });

  it('should change the selected keyword from the modal', async () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        previewSearchTerm={longerSearchTermsList[0]}
      />
    );

    const modalButton = await screen.findByRole('button', {
      name: 'View all',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const keyword2 = await within(
      await screen.findByLabelText('Search Keywords Modal')
    ).findByRole('button', {
      name: longerSearchTermsList[2],
    });

    act(() => {
      keyword2.click();
    });

    expect(mockProps.selectPreviewSearchTerm).toHaveBeenCalledWith(
      longerSearchTermsList[2]
    );
  });

  it('should remove additional keywords', async () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        previewSearchTerm={longerSearchTermsList[0]}
      />
    );

    const modalButton = await screen.findByRole('button', {
      name: 'View all',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const modal = await screen.findByLabelText('Search Keywords Modal');
    expect(modal).toBeVisible();

    const keyword2remove = await within(modal).findByRole('button', {
      name: `Remove keyword: ${longerSearchTermsList[3]}`,
    });

    act(() => {
      keyword2remove.click();
    });

    expect(mockProps.removeSearchTerm).toHaveBeenCalledWith(
      longerSearchTermsList[3]
    );
  });
});
