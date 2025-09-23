import { type ChangeEvent, type FormEvent, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingCategory,
  MerchandisingCountryCode,
  MerchandisingPagination,
} from '@/libs/api';
import { Button, Count, ErrorMessage, Typography } from '@/libs/components';
import {
  Arrow,
  ArrowContainer,
  DropdownButton,
  DropdownContainer,
  DropdownOption,
  DropdownWrapperNoBorder,
} from '@/libs/components/dropdown/dropdown.styles';
import {
  KeyWordPill,
  ModalFooter,
  Popover,
  RemoveKeyWordPill,
  StyledCloseButton,
} from '@/libs/components/search-keywords/search-keywords-modal.styles';
import { useGetCategories, useOnOutsideClick } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import { checkForDuplicates } from '@/libs/utils/check-for-duplicates';
import { formatHTMLStrings } from '@/libs/utils/format-html-strings';

import Image from 'next/image';

import {
  Container,
  DropdownText,
  DropdownWrapper,
  ModalCategoriesList,
  ModalSelectedCategory,
  ModalWrapper,
  Row,
  SearchForm,
  SearchInput,
  SearchValue,
  SearchWrapper,
  StyledIcon,
  Wrapper,
} from './category.styles';

const SEARCH_DEBOUNCE_WAIT = 500;

const DEFAULT_DROPDOWN_WIDTH = 256;
const ACTIVE_DROPDOWN_WIDTH = 320;

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
  writeEnabled: boolean;
  selectedCategoriesInfo: Array<{
    id?: string;
    name?: string;
    plpUrl?: string;
  }>;
  countryCode?: MerchandisingCountryCode;
};

export const CategorySearch = ({
  onClearSelection,
  onSelectCategory,
  previewCategory,
  selectedCategories,
  selectPreviewCategory,
  selectedCategoriesInfo,
  countryCode = 'UK_IE',
  writeEnabled,
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
    categories: Array<Required<MerchandisingCategory>>;
    pagination: MerchandisingPagination;
  }>({
    categories: [],
    pagination: {},
  });

  const [visibleTooltip, setVisibleTooltip] = useState<string | undefined>();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: () => setIsDropdownOpen(false),
  });

  useEffect(() => {
    setCategoryResults({
      categories: [],
      pagination: {},
    });
    setSearchValue('');
  }, [countryCode]);

  const [duplicationError, setDuplicationError] = useState('');

  const searchCategories = async (
    query: string,
    countryCode: MerchandisingCountryCode
  ) => {
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
    // istanbul ignore else
    if (e.key === 'Escape' && isDropdownOpen) {
      e.preventDefault();
      setIsDropdownOpen(false);
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
    const hasDuplicates = checkForDuplicates(
      [...selectedCategories],
      category.identifier,
      'ruleset'
    );

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      onSelectCategory(category);
      setDuplicationError('');

      // istanbul ignore else
      if (selectedCategories.length === 0) {
        selectPreviewCategory(category.identifier);
      }
    }
  };

  const CategoryRow = (category: Required<MerchandisingCategory>) => (
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
      <Typography variant="bodySmall">
        {category.identifier} | {formatHTMLStrings(category.name)}{' '}
        {category.path && `| ${category.path}`}
      </Typography>
    </Row>
  );

  const getCurrentPath = (category: string) => {
    return selectedCategoriesInfo?.find((c) => c.id === category)?.plpUrl;
  };

  const getCurrentName = (category: string) => {
    return formatHTMLStrings(
      selectedCategoriesInfo?.find((c) => c.id === category)?.name
    );
  };

  return (
    <Wrapper>
      <Typography as="p" withMargin variant="labelMedium">
        Category
        <Count aria-label="number of categories">
          {selectedCategories.length}
        </Count>
      </Typography>
      <DropdownWrapper>
        <DropdownWrapperNoBorder
          isDropdownOpen={isDropdownOpen}
          width={
            previewCategory ? DEFAULT_DROPDOWN_WIDTH : ACTIVE_DROPDOWN_WIDTH
          }
          ref={dropdownWrapperRef}
          onKeyDown={handleOnKeyDown}
        >
          <DropdownButton
            isDropdownOpen={isDropdownOpen}
            onClick={() =>
              selectedCategories.length > 1
                ? setIsDropdownOpen(!isDropdownOpen)
                : setIsModalOpen(true)
            }
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="select category"
            disabled={!previewCategory}
          >
            {previewCategory ? (
              <span
                onMouseEnter={() => setVisibleTooltip(previewCategory)}
                onMouseLeave={() => setVisibleTooltip(undefined)}
              >
                {previewCategory}
              </span>
            ) : (
              'Add categories to display here'
            )}
            {previewCategory && getCurrentPath(previewCategory) && (
              <Popover
                isOpen={visibleTooltip}
                role="tooltip"
                style={{ top: '-32px' }}
              >
                {getCurrentName(previewCategory)}{' '}
                {getCurrentPath(previewCategory)}
              </Popover>
            )}
            <ArrowContainer borderLeft={false}>
              <Arrow isDropdownOpen={isDropdownOpen} />
            </ArrowContainer>
          </DropdownButton>

          <DropdownContainer isDropdownOpen={isDropdownOpen} role="listbox">
            {selectedCategoriesInfo
              .filter((cat) => cat.id !== previewCategory)
              .map((category) => (
                <DropdownOption
                  key={category.id}
                  hoverColour="#f5f5f5"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    selectPreviewCategory(category.id);
                  }}
                  align="left"
                >
                  <DropdownText>
                    {category.id} {formatHTMLStrings(category.name)}
                  </DropdownText>
                </DropdownOption>
              ))}
          </DropdownContainer>
        </DropdownWrapperNoBorder>

        <Button
          theme="filled"
          isInline
          onClick={() => setIsModalOpen(true)}
          isDisabled={!writeEnabled}
        >
          Edit
        </Button>
      </DropdownWrapper>

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
              <Typography variant="titleSmall" isStrong withMargin as="h3">
                Search Categories
              </Typography>

              {writeEnabled && (
                <SearchWrapper>
                  <SearchForm onSubmit={onSubmit}>
                    <SearchInput
                      placeholder="Search..."
                      value={searchValue}
                      onChange={onSearchChange}
                    />
                    <StyledIcon name="Search" size={32} />
                  </SearchForm>
                </SearchWrapper>
              )}

              {categoryResults.categories.length > 0 && (
                <Container>
                  {categoryResults.categories.map(CategoryRow)}
                </Container>
              )}

              {previewCategory && (
                <ModalSelectedCategory>
                  <Typography as="h4" variant="bodyMedium">
                    Selected:
                  </Typography>
                  <KeyWordPill isSelected as="div">
                    <div>
                      <Typography variant="bodySmall" isStrong>
                        {previewCategory}
                        {getCurrentName(previewCategory) &&
                          ` : ${getCurrentName(previewCategory)}`}
                      </Typography>
                      <Typography variant="labelSmall">
                        {getCurrentPath(previewCategory)}
                      </Typography>
                    </div>

                    {writeEnabled && (
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
                    )}
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
                        <div>
                          <Typography variant="bodySmall" isStrong>
                            {category}
                            {getCurrentName(category) &&
                              ` : ${getCurrentName(category)}`}
                          </Typography>
                          <Typography variant="labelSmall">
                            {getCurrentPath(category)}
                          </Typography>
                        </div>
                      </SearchValue>
                      {writeEnabled && (
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
                      )}
                    </KeyWordPill>
                  ))}
              </ModalCategoriesList>
            </ModalWrapper>

            {duplicationError && (
              <ErrorMessage style={{ padding: 0 }} role="alert">
                {duplicationError}
              </ErrorMessage>
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
