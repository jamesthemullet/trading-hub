import { useState, type ChangeEvent, type FormEvent } from 'react';

import styled from '@emotion/styled';
import type { Category, CategoryListData } from '@/libs/api';

import { Search } from '../search/search';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { Typography } from '../typography/typography';
import { useDebounce, useGetCategories } from '@/libs/hooks';

const SEARCH_DEBOUNCE_WAIT = 500;

const Wrapper = styled.div`
  margin-bottom: ${spacing(1)};
`;

const Container = styled.div`
  margin-bottom: ${spacing(2)};
  margin-top: -1px;
  position: relative;
  box-shadow: rgb(0 0 0 / 10%) 0 0 5px 2px;
  background: #f5f5f5;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding: ${spacing(1)};
  color: #1d1d1b;

  &:hover {
    background: #f1f1f1;
    cursor: pointer;
  }
`;

const Categories = styled.div`
  border-radius: 4px 4px 0 0;
  background-color: ${color.backgroundGrey};
  border-bottom: 1px solid #b1b1b1;
  padding: ${spacing(1)} ${spacing(1)} 0;
  margin-bottom: ${spacing(1)};
`;

const SelectedCategory = styled(Typography)`
  margin-bottom: ${spacing(1)};
  color: #fff;
  background-color: ${color.selectionBox};
  border-radius: 6px;
  padding: ${spacing(1)} ${spacing(2)};
  display: inline-flex;
  align-items: center;
`;

const SelectedCategoryClose = styled.button`
  background: url('/trading-hub/asset/icon-close.svg');
  width: 19px;
  height: 18px;
  display: inline-block;
  border: none;
`;

type Props = {
  onClearSelection: () => void;
  onSelectCategory: (category: Category) => void;
  selectedCategory?: Category;
};

export const CategorySearch = ({
  selectedCategory,
  onClearSelection,
  onSelectCategory,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const { getCategories } = useGetCategories();
  const [categoryResults, setCategoryResults] = useState<CategoryListData>({
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
      setCategoryResults(resp);
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

  if (selectedCategory) {
    return (
      <Wrapper>
        <Typography as="p" variant="small" style={{ marginBottom: spacing(1) }}>
          Category
        </Typography>
        <Categories>
          <SelectedCategory as="p">
            {selectedCategory.identifier}
            <SelectedCategoryClose
              aria-label="Remove selected category"
              onClick={() => {
                setSearchValue('');
                setCategoryResults({
                  categories: [],
                  pagination: {},
                });
                onClearSelection();
              }}
            />
          </SelectedCategory>
        </Categories>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Typography as="p" variant="small" style={{ marginBottom: spacing(1) }}>
        Category
      </Typography>
      <form onSubmit={onSubmit}>
        <Search value={searchValue} onChange={onSearchChange} />
      </form>
      {categoryResults && (
        <Container>
          {categoryResults.categories.map((category) => (
            <Row
              key={`row-${category.identifier}`}
              onClick={() => onSelectCategory(category)}
            >
              <Typography variant="small" as="p">
                {category.identifier} | {category.name}{' '}
                {category.path && `| ${category.path}`}
              </Typography>
            </Row>
          ))}
        </Container>
      )}
    </Wrapper>
  );
};
