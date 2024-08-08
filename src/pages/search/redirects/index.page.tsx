import styled from '@emotion/styled';
import { ChangeEvent, useState } from 'react';

import { Pagination } from '@/libs/api';
import {
  DataTable,
  Heading,
  Search,
  spacing,
  TablePagination,
} from '@/libs/components';
import { color } from '@/libs/components/utils/constants';

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

  /* istanbul ignore next */
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e);
  };

  /* istanbul ignore next */
  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    console.log(id);
  };

  /* istanbul ignore next */
  const onToggle = () => {};

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];
  const rows = [
    {
      id: '1',
      identifier: 'mens summer shirts | mens summer shirt',
      isEnabled: true,
      lastChanged: {
        date: '2024-08-01',
        user: 'John Doe',
      },
      onToggle,
      url: '/search/redirects/edit/1',
    },
  ];
  const pagination: Pagination = {
    totalItems: 1,
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Redirects']}
      />

      <PageNameLabel>Keyword Redirect</PageNameLabel>

      <PageWrapper>
        <ToolsContainer>
          <Search onChange={handleSearch} />
          <NewButton>
            <a href="/search/redirects/new">Add new rule</a>
          </NewButton>
        </ToolsContainer>

        <DataTable
          headings={headings}
          rows={rows}
          onDeleteRuleSet={onDeleteRuleSet}
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
