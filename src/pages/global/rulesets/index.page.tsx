import { useState } from 'react';

import styled from '@emotion/styled';
import { spacing } from '@/libs/components/utils/spacing';
import { useDebounce, useRuleSet, useGlobalRuleSetCreate } from '@/libs/hooks';
import { useRouter } from 'next/router';
import {
  Button,
  DataTable,
  Heading,
  Search,
  TablePagination,
} from '@/libs/components';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const ToolsContainer = styled.div`
  display: flex;
  align-items: left;

  margin: ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;

const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const RuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentPageIndex = currentPage - 1;

  const { globalRuleSets, pagination } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'global'
  );

  const { createGlobalRuleSet } = useGlobalRuleSetCreate();
  const router = useRouter();

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  // istanbul ignore next
  const onEnableDisableRuleSet = ({ id }: { id: string }) => {
    console.log('TODO LPN-1833', id);
  };

  // istanbul ignore next
  const onDeleteRuleSet = ({ id }: { id: string }) => {
    console.log('TODO LPN-1833', id);
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

  const rows = globalRuleSets.map(({ id, isEnabled, lastChanged }) => ({
    id: id,
    identifier: '*',
    isEnabled,
    lastChanged,
    onToggle: onEnableDisableRuleSet,
    url: `/global/rulesets/${id}`,
  }));

  const createNewRuleSet = async () => {
    const resp = await createGlobalRuleSet();

    if (resp) {
      return router.push(`/global/rulesets/edit/${resp.id}`);
    }
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <PageNameLabel>Global category ranking rules</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          <NewButton>
            <Button as="button" onClick={createNewRuleSet}>
              Add rule
            </Button>
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

export default RuleSets;
