import { useState } from 'react';

import styled from '@emotion/styled';
import type {
  MerchandisingRules,
  ReturnedRuleSet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';

import { spacing } from '@/libs/components/utils/spacing';
import {
  useDebounce,
  useRuleSet,
  useRuleSetDelete,
  useUpdateRuleSet,
} from '@/libs/hooks';
import {
  Button,
  Heading,
  Loader,
  Rulesets,
  Search,
  TablePagination,
  Title,
} from '@/libs/components';
import { Modal } from '@mantine/core';

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

const Divider = styled.span`
  border-bottom: solid 1px #000;
  width: 100%;
  display: inline-block;
`;
const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;

const RuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [ruleSetIdToDelete, setRuleSetIdToDelete] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [columnIdToSort, setColumnIdToSort] =
    useState<keyof ReturnedRuleSet>('categoryName');
  const [columnSortOrder, setColumnSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isSaving, updateRuleSet } = useUpdateRuleSet();

  const currentPageIndex = currentPage - 1;

  const { ruleSets, pagination, refetchRuleSetList, setRuleSets } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const { handleDelete } = useRuleSetDelete();

  const handleDeleteRuleSet = ({ rulesetId }: { rulesetId: string }) => {
    setRuleSetIdToDelete(rulesetId);
    setIsOpen(true);
  };
  const onDeleteRuleSet = async () => {
    await handleDelete({ rulesetId: ruleSetIdToDelete });

    setIsOpen(false);
    setRuleSetIdToDelete('');
    refetchRuleSetList();
  };

  const onEnableDisableRuleSet = async ({
    ruleSetId,
    facets,
    isEnabled,
    merchandisingRules,
    categoryId,
  }: {
    categoryId: string;
    facets?: Array<RuleSetFacetConfigWithId>;
    isEnabled: boolean;
    merchandisingRules: MerchandisingRules;
    ruleSetId: string;
  }) => {
    await updateRuleSet({
      id: ruleSetId,
      facets,
      merchandisingRules,
      categoryId,
      isEnabled,
    });
    const updatedRuleSetsList = ruleSets.map((ruleset: ReturnedRuleSet) =>
      ruleset.id === ruleSetId ? { ...ruleset, isEnabled } : ruleset
    );
    setRuleSets(updatedRuleSetsList);
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <PageNameLabel>Category ranking rules</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          <NewButton>
            <Button as="a" href="/rules/new">
              Add rule
            </Button>
          </NewButton>
        </ToolsContainer>

        <Rulesets
          rules={ruleSets}
          columnSortOrder={columnSortOrder}
          columnOrderName={columnIdToSort}
          onColumnOrderChange={(columnId) => {
            if (columnId === columnIdToSort) {
              setColumnSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            } else {
              setColumnSortOrder('asc');
            }
            setColumnIdToSort(columnId);
          }}
          onDeleteRuleSet={handleDeleteRuleSet}
          onEnableDisableRuleSet={onEnableDisableRuleSet}
        />

        <TablePagination
          pagination={pagination}
          pageSizes={pageSizes}
          currentPage={currentPage}
          currentPageSize={currentPageSize}
          setCurrentPage={setCurrentPage}
          setCurrentPageSize={setCurrentPageSize}
        />

        {isSaving && <Loader />}
      </PageWrapper>

      <Modal.Root
        centered
        opened={isOpen}
        onClose={
          // istanbul ignore next
          () => setIsOpen(false)
        }
        padding={10}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <Title>Delete rule?</Title>

            <Divider />

            <Buttons>
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>

              <Button onClick={onDeleteRuleSet} theme="primary">
                Remove
              </Button>
            </Buttons>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};

export default RuleSets;
