import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import type { Category, CountryCode, Pagination } from '@/libs/api';
import { useGetCategories } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Image from 'next/image';

import {
  KeyWordPill,
  ModalFooter,
  Popover,
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
  onSelectCategory: (category: {
    identifier: string;
    name: string;
    path: string;
  }) => void;
  previewCategory: string | undefined;
  selectedCategories: string[];
  selectPreviewCategory: (category: string | undefined) => void;
  selectedCategoriesInfo?: Array<{
    id?: string;
    name?: string;
    plpUrl?: string;
  }>;
  countryCode?: CountryCode;
  error?: string;
};

export const CategorySearch = ({
  onClearSelection,
  onSelectCategory,
  previewCategory,
  selectedCategories,
  selectPreviewCategory,
  selectedCategoriesInfo,
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

  const [visibleTooltip, setVisibleTooltip] = useState<string | undefined>();

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

  const additionalCategories = selectedCategories.filter(
    (category) => category !== previewCategory
  );

  const onAddCategory = (category: {
    identifier: string;
    name: string;
    path: string;
  }) => {
    onSelectCategory(category);

    if (selectedCategories.length === 0) {
      selectPreviewCategory(category.identifier);
    }
  };

  const CategoryRow = (category: Required<Category>) => (
    <Row
      key={`row-${category.identifier}-${category.name}-${category.path}`}
      onClick={() => {
        onAddCategory(category);
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

  const getCurrentPath = (category: string) => {
    return selectedCategoriesInfo?.find((c) => c.id === category)?.plpUrl;
  };

  const getCurrentName = (category: string) => {
    return selectedCategoriesInfo?.find((c) => c.id === category)?.name;
  };

  return (
    <Wrapper>
      <CategoryTitle>Category</CategoryTitle>
      <SearchBox>
        <SearchWrapper hasModal={selectedCategories.length > 0}>
          <SelectedCategories>
            {previewCategory && (
              <div style={{ position: 'relative' }}>
                <KeyWordPill
                  isSelected={true}
                  aria-label="Preview category"
                  as="p"
                  role="button"
                  onMouseEnter={() => setVisibleTooltip(previewCategory)}
                  onMouseLeave={() => setVisibleTooltip(undefined)}
                >
                  <SearchValue disabled={true}>
                    {previewCategory}
                    {getCurrentName(previewCategory) &&
                      ` : ${getCurrentName(previewCategory)}`}
                  </SearchValue>
                  <RemoveKeyWordPill
                    onClick={() => {
                      onClearSelection(previewCategory);
                      if (previewCategory) {
                        selectPreviewCategory(
                          additionalCategories.length
                            ? additionalCategories[0]
                            : undefined
                        );
                      }
                    }}
                    aria-label={`Remove category: ${previewCategory}`}
                  >
                    <Image
                      alt=""
                      src={`/trading-hub/asset/icon-remove-selected-chip.svg`}
                      width={16}
                      height={16}
                    />
                  </RemoveKeyWordPill>
                </KeyWordPill>
                {getCurrentPath(previewCategory) && (
                  <Popover isOpen={visibleTooltip} role="tooltip">
                    {getCurrentPath(previewCategory)}
                  </Popover>
                )}
              </div>
            )}
          </SelectedCategories>
          {selectedCategories.length === 0 && (
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
        {selectedCategories.length > 0 && (
          <ViewAllButton
            onClick={() => setIsModalOpen(true)}
            theme="secondary"
            isInline={true}
          >
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
                <ModalSelectedCategory>
                  <Label as="h4">Selected: </Label>
                  <KeyWordPill isSelected as="div">
                    <p>
                      <span>
                        {previewCategory}
                        {getCurrentName(previewCategory) &&
                          ` : ${getCurrentName(previewCategory)}`}
                      </span>
                      <span>{getCurrentPath(previewCategory)}</span>
                    </p>

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
                        src="/trading-hub/asset/icon-remove-selected-chip.svg"
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
                    >
                      <SearchValue
                        onClick={() => selectPreviewCategory(category)}
                        aria-label={`Additional category ${category}`}
                      >
                        <p>
                          <span>
                            {category}
                            {getCurrentName(category) &&
                              ` : ${getCurrentName(category)}`}
                          </span>
                          <span>{getCurrentPath(category)}</span>
                        </p>
                      </SearchValue>
                      <RemoveKeyWordPill
                        onClick={() => onClearSelection(category)}
                        aria-label={`Remove category from modal: ${category}`}
                      >
                        <Image
                          alt=""
                          src="/trading-hub/asset/icon-remove-chip.svg"
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
            >
              Close
            </StyledCloseButton>
          </ModalFooter>
        </Modal.Content>
      </Modal.Root>
    </Wrapper>
  );
};
