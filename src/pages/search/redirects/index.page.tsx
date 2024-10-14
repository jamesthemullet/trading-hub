import { useState } from 'react';
import { useRouter } from 'next/router';

import {
  KeywordRedirect,
  ReturnedKeywordRedirect,
  ReturnedKeywordRedirects,
} from '@/libs/api';
import { DataTable, Heading, Search, TablePagination } from '@/libs/components';
import { FEATURE_FLAGS } from '@/libs/components/utils/feature-flags';
import {
  NewButton,
  PageNameLabel,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import {
  useRedirectCreate,
  useRedirectDelete,
  useRedirectUpdate,
  useSearchRedirectList,
} from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

const RedirectRuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const currentPageIndex = currentPage - 1;
  const { deleteRedirect } = useRedirectDelete();
  const { updateRedirect } = useRedirectUpdate();

  const { createRedirect } = useRedirectCreate();
  const router = useRouter();

  const createDuplicatedRedirect = async (redirect: KeywordRedirect) => {
    const response = await createRedirect({
      redirect: { ...redirect, isEnabled: false },
    });

    if (response) {
      router.push(`/search/redirects/edit/${response.id}`);
    }
  };

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

  const onDuplicateRedirect = (id: string) => {
    const redirectToCopy = redirects.find((redirect) => redirect.id === id);

    // istanbul ignore next
    if (!redirectToCopy) return;
    createDuplicatedRedirect(redirectToCopy);
  };

  const onDeleteRedirect = async ({ id }: { id: string }) => {
    await deleteRedirect({ redirectId: id });

    refetchRedirectList();
  };

  const headings = [
    'Identifier',
    ...(FEATURE_FLAGS.scheduling ? ['Schedule'] : []),
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const rows = redirects.map(
    ({ id, keywords, isEnabled, lastChanged, startDate, endDate }) => ({
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
      ...(FEATURE_FLAGS.scheduling && { startDate, endDate }),
    })
  );

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
            <Link href="/search/redirects/new">Add new rule</Link>
          </NewButton>
        </ToolsContainer>

        <DataTable
          headings={headings}
          rows={rows}
          onDeleteRuleSet={onDeleteRedirect}
          onDuplicate={onDuplicateRedirect}
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
