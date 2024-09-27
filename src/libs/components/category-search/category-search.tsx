import { type ChangeEvent, type FormEvent, useState } from 'react';

import type { Category, Pagination } from '@/libs/api';
import { useGetCategories } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import { Search } from '../search/search';
import { Text } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import { Container, Row, Wrapper } from './category.styles';
import { SelectedCategory } from './selected-category';

const SEARCH_DEBOUNCE_WAIT = 500;

type Props = {
  onClearSelection: () => void;
  onSelectCategory: (category: Required<Category>) => void;
  selectedCategory?: Required<Category>;
  canRemoveCategory?: boolean;
};

export const CategorySearch = ({
  selectedCategory,
  onClearSelection,
  onSelectCategory,
  canRemoveCategory,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const { getCategories } = useGetCategories();
  const [categoryResults, setCategoryResults] = useState<{
    /**
     * Category type contains all fields that are optional, this is a bad design and should be fixed in future in API: https://jira.marksandspencer.app/browse/LPN-2687
     * For now we will do following conversion:
     * {} -> undefined
     * {
     *    name: string | undefined,
     *    identifier: string | undefined,
     *    path: string | undefined
     * } -> {
     *    identifier: string,
     *    name: string,
     *    path: string
     * }
     * where undefined is replaced with empty string
     */
    categories: Array<Required<Category>>;
    pagination: Pagination;
  }>({
    categories: [],
    pagination: {},
  });
  const searchCategories = async (query: string) => {
    const resp = await getCategories({
      query,
      rows: 5,
      start: 0,
    });

    if (resp !== undefined) {
      setCategoryResults({
        categories: resp.categories
          .filter(
            (category) => category.identifier || category.name || category.path
          )
          .map((category) => {
            return {
              identifier: category.identifier || '',
              name: category.name || '',
              path: category.path || '',
            };
          }),
        pagination: resp.pagination,
      });
    }
  };

  const { callback: onSearchRequest, cancel } = useDebounce(
    async (value: string) => {
      await searchCategories(value);
    },
    SEARCH_DEBOUNCE_WAIT
  );

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    cancel();
    onSearchRequest(value);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await searchCategories(searchValue);
  };

  if (selectedCategory && selectedCategory.identifier) {
    return (
      <SelectedCategory
        label={selectedCategory.identifier}
        onClick={() => {
          setSearchValue('');
          setCategoryResults({
            categories: [],
            pagination: {},
          });
          onClearSelection();
        }}
        canRemoveCategory={canRemoveCategory}
      />
    );
  }

  return (
    <Wrapper>
      <Text style={{ marginBottom: spacing(1) }}>Category</Text>
      <form onSubmit={onSubmit}>
        <Search value={searchValue} onChange={onSearchChange} />
      </form>
      {categoryResults && (
        <Container>
          {categoryResults.categories.map((category) => (
            <Row
              key={`row-${category.identifier}-${category.name}-${category.path}`}
              onClick={() => onSelectCategory(category)}
              aria-label={`Select category ${category.identifier}`}
            >
              <Text>
                {category.identifier} | {category.name}{' '}
                {category.path && `| ${category.path}`}
              </Text>
            </Row>
          ))}
        </Container>
      )}
    </Wrapper>
  );
};
