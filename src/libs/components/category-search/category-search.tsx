import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import type { Category, CountryCode, Pagination } from '@/libs/api';
import { useGetCategories } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Image from 'next/image';

import {
  KeyWordPill,
  ModalFooter,
  RemoveKeyWordPill,
  StyledCloseButton,
} from '../keywords/search-keywords/modal.styles';
import {
  ErrorMessage,
  Header3,
  Label,
  Text,
} from '../typography/typography.styles';
import {
  CategoryTitle,
  Container,
  ModalCategoriesList,
  ModalSelectedCategory,
  ModalWrapper,
  Row,
  SearchBox,
  SearchForm,
  SearchInput,
  SearchValue,
  SearchWrapper,
  SelectedCategories,
  StyledIcon,
  ViewAllButton,
  Wrapper,
} from './category.styles';

const SEARCH_DEBOUNCE_WAIT = 500;

type Props = {
  onClearSelection: (category: string) => void;
  onSelectCategory: (category: string) => void;
  previewCategory: string | undefined;
  selectedCategories: string[];
  selectPreviewCategory: (category: string | undefined) => void;
  countryCode?: CountryCode;
  error?: string;
};

export const CategorySearch = ({
  onClearSelection,
  onSelectCategory,
  previewCategory,
  selectedCategories,
  selectPreviewCategory,
  countryCode = 'UK_IE',
  error,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    setCategoryResults({
      categories: [],
      pagination: {},
    });
    setSearchValue('');
  }, [countryCode]);

  const searchCategories = async (query: string, countryCode: CountryCode) => {
    const resp = await getCategories({
      query,
      rows: 5,
      start: 0,
      countryCode,
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
      await searchCategories(value, countryCode);
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
    await searchCategories(searchValue, countryCode);
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setCategoryResults({
        categories: [],
        pagination: {},
      });
      setSearchValue('');
    }
  };

  const visibleCategories = [...selectedCategories]
    .sort((a, b) =>
      a === previewCategory ? -1 : b === previewCategory ? 1 : 0
    )
    .slice(0, 2);

  const additionalCategories = selectedCategories.filter(
    (category) => category !== previewCategory
  );

  const CategoryRow = (category: Required<Category>) => (
    <Row
      key={`row-${category.identifier}-${category.name}-${category.path}`}
      onClick={() => {
        onSelectCategory(category.identifier);
        setSearchValue('');
        setCategoryResults({
          categories: [],
          pagination: {},
        });
      }}
      aria-label={`Select category ${category.identifier}`}
    >
      <Text>
        {category.identifier} | {category.name}{' '}
        {category.path && `| ${category.path}`}
      </Text>
    </Row>
  );

  return (
    <Wrapper>
      <CategoryTitle>Category</CategoryTitle>
      <SearchBox>
        <SearchWrapper hasModal={selectedCategories.length > 1}>
          <SelectedCategories>
            {visibleCategories.map((category) => {
              const isPreviewCategory = category === previewCategory;
              return (
                <KeyWordPill
                  key={category}
                  isSelected={isPreviewCategory}
                  aria-label={
                    isPreviewCategory
                      ? 'Preview category'
                      : 'Additional category'
                  }
                  as="p"
                  role="button"
                >
                  {isPreviewCategory ? (
                    category
                  ) : (
                    <SearchValue
                      onClick={() => selectPreviewCategory(category)}
                    >
                      {category}
                    </SearchValue>
                  )}
                  <RemoveKeyWordPill
                    onClick={() => {
                      onClearSelection(category);
                      if (isPreviewCategory) {
                        selectPreviewCategory(
                          additionalCategories.length
                            ? additionalCategories[0]
                            : undefined
                        );
                      }
                    }}
                    aria-label={`Remove category: ${category}`}
                  >
                    <Image
                      alt=""
                      src={`/trading-hub/asset/icon-remove-${category === previewCategory ? 'selected-' : ''}chip.svg`}
                      width={16}
                      height={16}
                    />
                  </RemoveKeyWordPill>
                </KeyWordPill>
              );
            })}
          </SelectedCategories>
          {selectedCategories.length < 2 && (
            <SearchForm onSubmit={onSubmit}>
              <SearchInput
                placeholder="Search..."
                value={searchValue}
                onChange={onSearchChange}
                aria-label="Search for category"
              />
              <StyledIcon name="Search" size={32} />
            </SearchForm>
          )}
        </SearchWrapper>
        {selectedCategories.length > 1 && (
          <ViewAllButton onClick={() => setIsModalOpen(true)} theme="secondary">
            View all
          </ViewAllButton>
        )}
      </SearchBox>
      {categoryResults.categories.length > 0 && !isModalOpen && (
        <Container onKeyDown={handleOnKeyDown}>
          {categoryResults.categories.map(CategoryRow)}
        </Container>
      )}

      <Modal.Root
        opened={isModalOpen}
        onClose={
          // istanbul ignore next
          () => setIsModalOpen(false)
        }
        centered
        padding={20}
        size="auto"
        aria-label="Category search modal"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <ModalWrapper>
              <Header3>Category</Header3>

              <SearchBox>
                <SearchWrapper hasModal>
                  <SearchForm onSubmit={onSubmit}>
                    <SearchInput
                      placeholder="Search..."
                      value={searchValue}
                      onChange={onSearchChange}
                    />
                    <StyledIcon name="Search" size={32} />
                  </SearchForm>
                </SearchWrapper>
              </SearchBox>

              {categoryResults.categories.length > 0 && (
                <Container>
                  {categoryResults.categories.map(CategoryRow)}
                </Container>
              )}

              {previewCategory && (
                <ModalSelectedCategory aria-label="Preview category">
                  <Label as="h4">Selected: </Label>
                  <KeyWordPill isSelected as="p">
                    {previewCategory}
                    <RemoveKeyWordPill
                      onClick={() => {
                        onClearSelection(previewCategory);
                        selectPreviewCategory(
                          additionalCategories.length
                            ? additionalCategories[0]
                            : undefined
                        );
                      }}
                      aria-label={`Remove category from modal: ${previewCategory}`}
                    >
                      <Image
                        alt=""
                        src={`/trading-hub/asset/icon-remove-selected-chip.svg`}
                        width={16}
                        height={16}
                      />
                    </RemoveKeyWordPill>
                  </KeyWordPill>
                </ModalSelectedCategory>
              )}

              <ModalCategoriesList>
                {selectedCategories
                  .filter((category) => category !== previewCategory)
                  .map((category) => (
                    <KeyWordPill
                      isSelected={false}
                      key={`category-${category}`}
                      as="p"
                    >
                      <SearchValue
                        onClick={() => selectPreviewCategory(category)}
                      >
                        {category}
                      </SearchValue>
                      <RemoveKeyWordPill
                        onClick={() => onClearSelection(category)}
                        aria-label={`Remove category from modal: ${category}`}
                      >
                        <Image
                          alt=""
                          src={`/trading-hub/asset/icon-remove-chip.svg`}
                          width={16}
                          height={16}
                        />
                      </RemoveKeyWordPill>
                    </KeyWordPill>
                  ))}
              </ModalCategoriesList>
            </ModalWrapper>
            {error && (
              <ErrorMessage style={{ padding: 0 }}>{error}</ErrorMessage>
            )}
          </Modal.Body>
          <ModalFooter>
            <StyledCloseButton
              theme="secondary"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
            >
              Close
            </StyledCloseButton>
          </ModalFooter>
        </Modal.Content>
      </Modal.Root>
    </Wrapper>
  );
};
