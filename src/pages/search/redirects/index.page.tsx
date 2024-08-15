import styled from '@emotion/styled';
import { useState } from 'react';

import { ReturnedKeywordRedirect, ReturnedKeywordRedirects } from '@/libs/api';
import {
  DataTable,
  Heading,
  Search,
  spacing,
  TablePagination,
} from '@/libs/components';
import { color } from '@/libs/components/utils/constants';
import {
  useDebounce,
  useRedirectDelete,
  useRedirectUpdate,
  useSearchRedirectList,
} from '@/libs/hooks';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;

const ToolsContainer = styled.div`
  display: flex;
  align-items: left;

  margin: ${spacing(2)};
`;

const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};

  & a {
    color: ${color.focusBlue};
  }
`;

const RedirectRuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const currentPageIndex = currentPage - 1;
  const { deleteRedirect } = useRedirectDelete();
  const { updateRedirect } = useRedirectUpdate();

  const { pagination, redirects, refetchRedirectList, setKeywordList } =
    useSearchRedirectList(
      searchQuery,
      currentPageIndex * currentPageSize,
      currentPageSize
    );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const onEnableDisableRedirect = async ({ id }: { id: string }) => {
    const redirect = redirects.find((redirect) => redirect.id === id);

    // istanbul ignore next
    if (!redirect) return;

    const { isEnabled } = redirect;
    await updateRedirect({
      redirect: {
        ...redirect,
        isEnabled: !isEnabled,
      },
      redirectId: id,
    });
    const updatedRedirectsList: ReturnedKeywordRedirects = {
      redirects: redirects.map((redriect: ReturnedKeywordRedirect) =>
        // istanbul ignore next
        redriect.id === id ? { ...redriect, isEnabled: !isEnabled } : redriect
      ),
      pagination,
    };
    setKeywordList(updatedRedirectsList);
  };

  const onDeleteRedirect = async ({ id }: { id: string }) => {
    await deleteRedirect({ redirectId: id });

    refetchRedirectList();
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];
  const rows = redirects.map(({ id, keywords, isEnabled, lastChanged }) => ({
    id: id,
    identifier: keywords
      .map((term) =>
        !!searchQuery.length &&
        term.toLowerCase().startsWith(searchQuery.toLowerCase())
          ? `<b>${term}</b>`
          : term
      )
      .join(' | '),
    isEnabled,
    lastChanged,
    onToggle: onEnableDisableRedirect,
    url: `/search/redirects/edit/${id}`,
  }));

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Redirects']}
      />

      <PageNameLabel>Keyword Redirect</PageNameLabel>

      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          <NewButton>
            <a href="/search/redirects/new">Add new rule</a>
          </NewButton>
        </ToolsContainer>

        <DataTable
          headings={headings}
          rows={rows}
          onDeleteRuleSet={onDeleteRedirect}
        />

        <TablePagination
          pagination={pagination}
          pageSizes={pageSizes}
          currentPage={currentPage}
          currentPageSize={currentPageSize}
          setCurrentPage={setCurrentPage}
          setCurrentPageSize={setCurrentPageSize}
        />
      </PageWrapper>
    </>
  );
};

export default RedirectRuleSets;
