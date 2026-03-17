import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingCategory,
  MerchandisingCountryCode,
  MerchandisingPagination,
} from '@/libs/api';
import { Button, Count, ErrorMessage, Typography } from '@/libs/components';
import dropdownStyles from '@/libs/components/dropdown/dropdown.module.css';
import { useGetCategories, useOnOutsideClick } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import { checkForDuplicates } from '@/libs/utils/check-for-duplicates';
import { formatHTMLStrings } from '@/libs/utils/format-html-strings';

import Image from 'next/image';

import styles from './category-search.module.css';

const SEARCH_DEBOUNCE_WAIT = 500;

const DEFAULT_DROPDOWN_WIDTH = 250;
const ACTIVE_DROPDOWN_WIDTH = 320;

type CategoryRowProps = {
  category: Required<MerchandisingCategory>;
  onAddCategory: (category: {
    identifier: string;
    name: string;
    path: string;
  }) => void;
  onSearchValueChange: (value: string) => void;
  onCategoryResultsClear: () => void;
};

const CategoryRow = ({
  category,
  onAddCategory,
  onSearchValueChange,
  onCategoryResultsClear,
}: CategoryRowProps) => (
  <Button
    className={styles.row}
    type="button"
    key={`row-${category.identifier}-${category.name}-${category.path}`}
    onClick={() => {
      onAddCategory(category);
      onSearchValueChange('');
      onCategoryResultsClear();
    }}
    aria-label={`Select category ${category.identifier}`}
  >
    <Typography variant="bodySmall" as="span">
      {category.identifier} | {formatHTMLStrings(category.name)}{' '}
      {category.path && `| ${category.path}`}
    </Typography>
  </Button>
);

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

  const handleOnKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // istanbul ignore else
    if (event.key === 'Escape' && isDropdownOpen) {
      event.preventDefault();
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

  const handleCategoryResultsClear = () => {
    setSearchValue('');
    setCategoryResults({
      categories: [],
      pagination: {},
    });
  };

  const getCurrentPath = (category: string) => {
    return selectedCategoriesInfo?.find((c) => c.id === category)?.plpUrl;
  };

  const getCurrentName = (category: string) => {
    return formatHTMLStrings(
      selectedCategoriesInfo?.find((c) => c.id === category)?.name
    );
  };

  const handlePreviewMouseEnter = () => {
    /* istanbul ignore next */
    if (!previewCategory) {
      return;
    }
    setVisibleTooltip(previewCategory);
  };

  const handlePreviewMouseLeave = () => {
    setVisibleTooltip(undefined);
  };

  return (
    <div>
      <Typography as="p" withMargin variant="labelMedium">
        Category
        <Count aria-label="number of categories">
          {selectedCategories.length}
        </Count>
      </Typography>
      <div className={styles.dropdownWrapper}>
        <div
          className={dropdownStyles.dropdownWrapper}
          data-has-border-bottom="false"
          data-height="large"
          data-is-dropdown-open={isDropdownOpen}
          data-width={
            previewCategory ? DEFAULT_DROPDOWN_WIDTH : ACTIVE_DROPDOWN_WIDTH
          }
          ref={dropdownWrapperRef}
        >
          <Button
            className={dropdownStyles.dropdownButton}
            type="button"
            data-is-dropdown-open={isDropdownOpen}
            onClick={() =>
              selectedCategories.length > 1
                ? setIsDropdownOpen(!isDropdownOpen)
                : setIsModalOpen(true)
            }
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            aria-label="select category"
            isDisabled={!previewCategory}
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
            onKeyDown={handleOnKeyDown}
          >
            {previewCategory ? (
              <Typography as="span" variant="bodySmall">
                {previewCategory}
              </Typography>
            ) : (
              <Typography as="span" variant="bodySmall">
                Add categories to display here
              </Typography>
            )}
            {previewCategory &&
              getCurrentPath(previewCategory) &&
              visibleTooltip && (
                <div
                  className={styles.tooltip}
                  data-is-open={visibleTooltip}
                  role="tooltip"
                >
                  <Typography as="span" variant="bodySmall">
                    {getCurrentName(previewCategory)}{' '}
                    {getCurrentPath(previewCategory)}
                  </Typography>
                </div>
              )}
            <div className={dropdownStyles.arrowContainer}>
              <span
                className={dropdownStyles.arrow}
                data-is-dropdown-open={isDropdownOpen}
              />
            </div>
          </Button>

          <div
            className={dropdownStyles.dropdownContentContainer}
            data-is-dropdown-open={isDropdownOpen}
            role="menu"
            tabIndex={-1}
            aria-label="Select category to preview"
            onKeyDown={handleOnKeyDown}
          >
            {selectedCategoriesInfo
              .filter((cat) => cat.id !== previewCategory)
              .map((category) => (
                <Button
                  className={dropdownStyles.dropdownOption}
                  type="button"
                  key={category.id}
                  data-hover-grey
                  role="menuitem"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    selectPreviewCategory(category.id);
                  }}
                >
                  <Typography as="span" variant="bodySmall">
                    {category.id} {formatHTMLStrings(category.name)}
                  </Typography>
                </Button>
              ))}
          </div>
        </div>

        <Button
          theme="filled"
          isInline
          onClick={() => setIsModalOpen(true)}
          isDisabled={!writeEnabled}
        >
          Edit
        </Button>
      </div>

      <Modal.Root
        opened={isModalOpen}
        onClose={
          // istanbul ignore next
          () => setIsModalOpen(false)
        }
        centered
        padding={20}
        size="auto"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content aria-label="Category search modal">
          <Modal.Body>
            <div className={styles.modalWrapper}>
              <Typography variant="titleSmall" isStrong withMargin as="h2">
                Search Categories
              </Typography>

              {writeEnabled && (
                <div className={styles.searchWrapper}>
                  <form className={styles.searchForm} onSubmit={onSubmit}>
                    <input
                      className={styles.searchInput}
                      placeholder="Search..."
                      value={searchValue}
                      onChange={onSearchChange}
                    />
                    <Image
                      src="https://static.marksandspencer.com/icons/svgs/Search-v3-1.svg"
                      width={24}
                      height={24}
                      alt=""
                    />
                  </form>
                </div>
              )}

              {categoryResults.categories.length > 0 && (
                <div className={styles.resultsContainer}>
                  {categoryResults.categories.map((category) => (
                    <CategoryRow
                      key={`row-${category.identifier}-${category.name}-${category.path}`}
                      category={category}
                      onAddCategory={onAddCategory}
                      onSearchValueChange={setSearchValue}
                      onCategoryResultsClear={handleCategoryResultsClear}
                    />
                  ))}
                </div>
              )}

              {previewCategory && (
                <div className={styles.modalSelectedCategory}>
                  <Typography as="h3" variant="bodyMedium">
                    Selected:
                  </Typography>
                  <div className={styles.keywordPill} data-is-selected="true">
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
                      <Button
                        appearance="icon"
                        className={styles.removeKeywordPill}
                        type="button"
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
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <ul className={styles.modalCategoriesList}>
                {selectedCategories
                  .filter((category) => category !== previewCategory)
                  .map((category) => (
                    <li
                      className={styles.keywordPill}
                      key={`category-${category}`}
                    >
                      <Button
                        appearance="plain"
                        type="button"
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
                      </Button>
                      {writeEnabled && (
                        <Button
                          appearance="icon"
                          className={styles.removeKeywordPill}
                          type="button"
                          onClick={() => onClearSelection(category)}
                          aria-label={`Remove category from modal: ${category}`}
                        >
                          <Image
                            alt=""
                            src="/trading-hub/asset/icon-remove-chip.svg"
                            width={16}
                            height={16}
                          />
                        </Button>
                      )}
                    </li>
                  ))}
              </ul>
            </div>

            {duplicationError && (
              <ErrorMessage>{duplicationError}</ErrorMessage>
            )}
          </Modal.Body>
          <div className={styles.modalFooter}>
            <Button theme="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal.Content>
      </Modal.Root>
    </div>
  );
};
