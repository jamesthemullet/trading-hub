import { act, screen, waitFor, within } from '@testing-library/react';
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
  addSearchTerms: jest.fn(),
  removeSearchTerm: jest.fn(),
  previewSearchTerm: undefined,
  selectPreviewSearchTerm: jest.fn(),
  isWriteEnabled: true,
};

describe('Search Keywords', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully', () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    expect(screen.getByText('Search Keywords')).toBeInTheDocument();
    expect(screen.getByText('keyword1')).toBeVisible();
    expect(screen.queryByText('keyword2')).not.toBeInTheDocument();
    expect(screen.queryByText('keyword3')).not.toBeInTheDocument();
    expect(screen.queryByText('keyword4')).not.toBeInTheDocument();
  });

  it('should not be editable in read only mode', () => {
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        previewSearchTerm={shorterSearchTermsList[0]}
        isWriteEnabled={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });

  it('should add a new keyword to the list with the modal being open', async () => {
    const addSearchTermsStub = jest.fn();
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        addSearchTerms={addSearchTermsStub}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(async () => {
      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermsStub).toHaveBeenCalledWith(['new keyword']);
    });
  });

  it('should add a new keyword in lowercase to the list with the modal being open', async () => {
    const addSearchTermsStub = jest.fn();
    const selectPreviewSearchTermStub = jest.fn();
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        previewSearchTerm={longerSearchTermsList[0]}
        addSearchTerms={addSearchTermsStub}
        selectPreviewSearchTerm={selectPreviewSearchTermStub}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(async () => {
      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'NEW keyword{enter}'
      );
    });

    await waitFor(() => {
      expect(addSearchTermsStub).toHaveBeenCalledWith(['new keyword']);
    });

    expect(selectPreviewSearchTermStub).not.toHaveBeenCalled();
  });

  it('should remove a keyword from the list on the modal', async () => {
    const removeSearchTermStub = jest.fn();
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        removeSearchTerm={removeSearchTermStub}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    const modal = await screen.findByLabelText('Search Keywords Modal');

    await waitFor(async () => {
      await user.click(
        within(modal).getByLabelText('Remove keyword: keyword5')
      );
    });

    await waitFor(() => {
      expect(removeSearchTermStub).toHaveBeenCalledWith('keyword5');
    });
  });

  it('should close the modal', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Close' }));
    });

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Close' })
      ).not.toBeInTheDocument();
    });
  });

  it('should not close the modal if the user tries to close it with an unfinished keyword', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

    await waitFor(async () => {
      await user.type(
        screen.getByLabelText('Add keyword to list'),
        'new keyword'
      );
    });

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Close' }));
    });

    await waitFor(() => {
      expect(
        screen.getByText('Please finish adding the keyword to close')
      ).toBeVisible();
    });

    expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
  });

  it('should show error when adding a keyword and input element is missing', async () => {
    const user = userEvent.setup({ delay: null });
    const addSearchTermsStub = jest.fn();

    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        addSearchTerms={addSearchTermsStub}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const getElementByIdSpy = jest
      .spyOn(document, 'getElementById')
      .mockReturnValue(null);

    await user.type(screen.getByLabelText('Add keyword to list'), '{Enter}');

    expect(addSearchTermsStub).not.toHaveBeenCalled();
    expect(screen.getByText('Keyword cannot be blank')).toBeVisible();

    getElementByIdSpy.mockRestore();
  });

  it('should filter attributes on user input', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords {...mockProps} searchTerms={longerSearchTermsList} />
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    const modal = await screen.findByLabelText('Search Keywords Modal');

    await waitFor(async () => {
      await user.type(
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
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

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

  it('should select an additional keyword as the preview keyword if the preview keyword is removed', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

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
    const user = userEvent.setup({ delay: null });
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={shorterSearchTermsList.slice(0, 1)}
        previewSearchTerm={shorterSearchTermsList[0]}
      />
    );

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Edit' }));
    });

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
        previewSearchTerm={longerSearchTermsList[1]}
      />
    );

    const modalButton = await screen.findByRole('button', {
      name: 'Edit',
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
      name: 'Edit',
    });

    act(() => {
      modalButton.click();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });

    const modal = await screen.findByLabelText('Search Keywords Modal');

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

  it('open the modal when only one category is in the dropdown', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={[longerSearchTermsList[0]]}
        previewSearchTerm={longerSearchTermsList[0]}
      />
    );

    const dropdownButton = screen.getByRole('button', {
      name: 'select keyword',
    });

    await user.click(dropdownButton);

    await waitFor(async () => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    });
  });

  it('select different categories from the dropdown', async () => {
    const user = userEvent.setup();
    const mockSelectKeyword = jest.fn();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        previewSearchTerm={longerSearchTermsList[0]}
        selectPreviewSearchTerm={mockSelectKeyword}
      />
    );

    const dropdownButton = screen.getByRole('button', {
      name: 'select keyword',
    });

    await user.click(dropdownButton);

    const otherCategory = screen.getByRole('menuitem', {
      name: longerSearchTermsList[1],
    });
    await user.click(otherCategory);

    await waitFor(() => {
      expect(mockSelectKeyword).toHaveBeenCalledWith(longerSearchTermsList[1]);
    });
  });

  it('should close the dropdown when Escape key is pressed', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <SearchKeywords
        {...mockProps}
        searchTerms={longerSearchTermsList}
        previewSearchTerm={longerSearchTermsList[0]}
      />
    );

    const dropdownButton = screen.getByRole('button', {
      name: 'select keyword',
    });

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('bulk keyword paste', () => {
    it('should add multiple comma-separated keywords in one operation', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, beta, gamma{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith([
          'alpha',
          'beta',
          'gamma',
        ]);
      });

      expect(screen.getByText('3 keywords added')).toBeVisible();
    });

    it('should show singular "keyword added" when only one term is added', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith(['alpha']);
      });

      expect(screen.getByText('1 keyword added')).toBeVisible();
    });

    it('should show a duplication error when adding a single keyword that already exists', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={['alpha']}
          previewSearchTerm="alpha"
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await user.click(screen.getByRole('button', { name: 'Edit' }));

      const modal = await screen.findByLabelText('Search Keywords Modal');

      await user.type(
        within(modal).getByLabelText('Add keyword to list'),
        'alpha{enter}'
      );

      expect(addSearchTermsStub).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(
          within(modal).getByText('Keyword alpha has already been added')
        ).toBeVisible();
      });
    });

    it('should skip duplicates and show summary with skipped count', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={['alpha']}
          previewSearchTerm="alpha"
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, beta{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith(['beta']);
      });

      expect(
        screen.getByText('1 keyword added, 1 duplicate skipped')
      ).toBeVisible();
    });

    it('should show singular "duplicate skipped" when only one duplicate is skipped', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={['alpha']}
          previewSearchTerm="alpha"
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, beta, gamma{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith(['beta', 'gamma']);
      });

      expect(
        screen.getByText('2 keywords added, 1 duplicate skipped')
      ).toBeVisible();
    });

    it('should show summary with pluralised skipped count when multiple duplicates skipped', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={['alpha', 'beta']}
          previewSearchTerm="alpha"
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, beta, gamma{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith(['gamma']);
      });

      expect(
        screen.getByText('1 keyword added, 2 duplicates skipped')
      ).toBeVisible();
    });

    it('should show "0 keywords added" when all terms are duplicates', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={['alpha', 'beta']}
          previewSearchTerm="alpha"
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, beta{enter}'
        );
      });

      expect(addSearchTermsStub).not.toHaveBeenCalled();
      expect(
        screen.getByText('0 keywords added, 2 duplicates skipped')
      ).toBeVisible();
    });

    it('should keep commas within a keyword when comma-splitting is switched off', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await user.click(
        await screen.findByRole('checkbox', {
          name: 'Separate keywords using commas',
        })
      );

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'jeans, skinny fit{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith(['jeans, skinny fit']);
      });
    });

    it('should show error when input is blank in bulk mode', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          '   {enter}'
        );
      });

      expect(addSearchTermsStub).not.toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Keyword cannot be blank')).toBeVisible();
      });
    });

    it('should add newline-separated keywords', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
      });

      const mockInput = { value: 'alpha\nbeta\ngamma' };
      const getElementByIdSpy = jest
        .spyOn(document, 'getElementById')
        .mockReturnValue(mockInput as unknown as HTMLElement);

      await user.type(screen.getByLabelText('Add keyword to list'), '{Enter}');

      getElementByIdSpy.mockRestore();

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith([
          'alpha',
          'beta',
          'gamma',
        ]);
      });
    });

    it('should deduplicate terms within the pasted input itself', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, alpha, beta{enter}'
        );
      });

      await waitFor(() => {
        expect(addSearchTermsStub).toHaveBeenCalledWith(['alpha', 'beta']);
      });

      expect(
        screen.getByText('2 keywords added, 1 duplicate skipped')
      ).toBeVisible();
    });

    it('should clear the bulk summary when the modal is closed', async () => {
      const addSearchTermsStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha{enter}'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('1 keyword added')).toBeVisible();
      });

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Close' }));
      });

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'Close' })
        ).not.toBeInTheDocument();
      });

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      expect(screen.queryByText('1 keyword added')).not.toBeInTheDocument();
    });

    it('should set preview keyword from first bulk-added term when no preview exists', async () => {
      const addSearchTermsStub = jest.fn();
      const selectPreviewStub = jest.fn();
      const user = userEvent.setup({ delay: null });
      renderWithProviders(
        <SearchKeywords
          {...mockProps}
          searchTerms={[]}
          addSearchTerms={addSearchTermsStub}
          previewSearchTerm={undefined}
          selectPreviewSearchTerm={selectPreviewStub}
        />,
        ['Cat.W', 'Search.W', 'Glob.W']
      );

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Edit' }));
      });

      await waitFor(async () => {
        await user.type(
          screen.getByLabelText('Add keyword to list'),
          'alpha, beta{enter}'
        );
      });

      await waitFor(() => {
        expect(selectPreviewStub).toHaveBeenCalledWith('alpha');
      });
    });
  });
});
