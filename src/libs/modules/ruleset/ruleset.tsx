import type { ReactElement } from 'react';
import { useReducer, useState } from 'react';

import type {
  MerchandisingCategoryRuleSet,
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingKeywordRuleSet,
  MerchandisingRules,
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  Button,
  CombinedDropdown,
  DropdownVariant,
  ErrorMessage,
  Loader,
  Tabs,
  Typography,
} from '@/libs/components';
import dropdownStyles from '@/libs/components/dropdown/dropdown.module.css';
import { InfoBox } from '@/libs/components/infoBox/info-box';
import type { LastChanged } from '@/libs/components/last-saved-by/last-saved-by';
import { RulesetDiffModal } from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal';
import { BulkActions } from '@/libs/containers/rulesets/bulk-actions-products';
import { DateTimePickerModal } from '@/libs/containers/shared/calendar/date-time-picker-modal';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import {
  CategorySearch,
  Preview,
  ProductSearchAll,
  RulesetAttributes,
  RulesetChanges,
  VisualEditor,
} from '@/libs/features';
import { SearchKeywords } from '@/libs/features/shared/search-keywords/search-keywords';
import { usePreview } from '@/libs/hooks';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useUnsavedChangesGuard } from '@/libs/hooks/use-unsaved-changes-guard';
import { track } from '@/libs/hooks/utils/analytics';
import { rulesetReducer } from '@/libs/stores/ruleset/reducer';
import {
  getDefaultPreviewCategoryId,
  isDeprioritisedCategory,
} from '@/libs/utils/is-deprioritised-category';

import isEqual from 'lodash/isEqual';
import Image from 'next/image';
import pluralize from 'pluralize';

import styles from './ruleset.module.css';

const MAX_PINNED_PRODUCTS_ALLOWED = 100;

const DEFAULT_MERCHANDISING_RULES: MerchandisingRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: {
    alphanumeric: [],
    numeric: [],
    product: [],
  },
  buries: {
    alphanumeric: [],
    numeric: [],
    product: [],
  },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

export const Ruleset = ({
  endDate,
  isEnabled,
  lastChanged,
  onCancel,
  onCreate,
  onCreateGlobalRuleset,
  onCreateKeywordSearchRuleset,
  onSave,
  originalRuleset,
  categoriesInfo,
  rulesetFacets,
  rulesetExcludedFacets,
  rulesetId,
  rulesetMerchandisingRules,
  rulesetType,
  searchTerms,
  startDate,
  countryCode,
  isWriteEnabled,
}: {
  isEnabled: boolean;
  lastChanged?: LastChanged;
  onSave?: ({
    ruleSetId,
    ruleSet,
    categoryIds,
    searchTerms,
  }: {
    ruleSetId: string;
    ruleSet: MerchandisingRuleSet;
    categoryIds?: Array<string>;
    searchTerms?: Array<string>;
  }) => void;
  onCancel: () => void;
  onCreate?: (
    args: Required<Pick<MerchandisingCategoryRuleSet, 'facets'>> &
      MerchandisingCategoryRuleSet
  ) => void;
  onCreateGlobalRuleset?: (args: MerchandisingRuleSet) => void;
  onCreateKeywordSearchRuleset?: (args: MerchandisingKeywordRuleSet) => void;
  originalRuleset?: MerchandisingRuleSet;
  categoriesInfo?: Array<{
    id: string;
    name?: string;
    plpUrl?: string;
  }>;
  rulesetFacets?: Array<MerchandisingRuleSetFacetConfigWithId>;
  rulesetExcludedFacets?: MerchandisingExcludedFacets;
  rulesetId?: string;
  rulesetMerchandisingRules?: MerchandisingRules;
  rulesetType: 'global' | 'category' | 'search';
  searchTerms?: string[];
  startDate?: string;
  endDate?: string;
  countryCode?: MerchandisingCountryCode;
  isWriteEnabled: boolean;
}): ReactElement => {
  const categoryIds = categoriesInfo?.map((category) => category.id);

  const defaultPreviewCategoryId = getDefaultPreviewCategoryId(categoryIds);

  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    categoryIds ?? []
  );
  const [selectedCategoriesInfo, setSelectedCategoriesInfo] = useState<
    {
      id?: string;
      name?: string;
      plpUrl?: string;
    }[]
  >(categoriesInfo ?? []);

  const [rulesetSearchTerms, setRulesetSearchTerms] = useState(
    searchTerms ?? []
  );
  const [currentEditorTab, setCurrentEditorTab] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [shouldShowPreview, setShouldShowPreview] = useState(false);
  const [isPendingConfirmation, setIsPendingConfirmation] = useState(false);
  const [pendingSave, setPendingSave] = useState<(() => void) | null>(null);

  const defaultPreviewCountryCode =
    isDeprioritisedCategory(defaultPreviewCategoryId) ||
    (rulesetType === 'search' && countryCode === 'IE')
      ? 'IE'
      : 'UK';

  const [selectedPreviewCountryCode, setSelectedPreviewCountryCode] = useState<
    'UK' | 'IE'
  >(defaultPreviewCountryCode);

  const onSelectCategory = (category: {
    identifier: string;
    name: string;
    path: string;
  }) => {
    setSelectedCategories([...selectedCategories, category.identifier]);
    setSelectedCategoriesInfo([
      ...selectedCategoriesInfo,
      {
        id: category.identifier,
        name: category.name,
        plpUrl: category.path,
      },
    ]);

    // istanbul ignore else
    if (!selectedCategories.length) {
      setPreviewValue(category.identifier);
      setSelectedPreviewCountryCode(
        isDeprioritisedCategory(category.identifier) ? 'IE' : 'UK'
      );
    }
    // istanbul ignore else
    if (!hasChanges) {
      setHasChanges(true);
    }
  };

  const [previewValue, setPreviewValue] = useState(
    defaultPreviewCategoryId ?? searchTerms?.[0]
  );

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [selectedSearchProducts, setSelectedSearchProducts] = useState<
    string[]
  >([]);

  const [ruleset, dispatch] = useReducer(rulesetReducer, {
    isEnabled,
    startDate,
    endDate,
    rules: rulesetMerchandisingRules ?? DEFAULT_MERCHANDISING_RULES,
    countryCode: countryCode ?? 'UK_IE',
  });

  const { rules: merchandisingRules } = ruleset;

  const hasUnsavedChanges =
    hasChanges ||
    !isEqual(
      merchandisingRules,
      rulesetMerchandisingRules ?? DEFAULT_MERCHANDISING_RULES
    );

  const { confirmNavigation } = useUnsavedChangesGuard(hasUnsavedChanges);

  const currentRulesetForDiff: MerchandisingRuleSet = {
    isEnabled,
    rules: merchandisingRules,
    facets: rulesetFacets,
    excludedFacets: rulesetExcludedFacets,
    startDate: ruleset.startDate,
    endDate: ruleset.endDate,
    countryCode: ruleset.countryCode,
  };

  const diffItems = useRulesetDiff(originalRuleset, currentRulesetForDiff, {
    isEnabled: isPendingConfirmation,
    ...(rulesetType === 'category' && {
      originalCategoryIds: categoryIds ?? [],
      currentCategoryIds: selectedCategories,
    }),
    ...(rulesetType === 'search' && {
      originalSearchTerms: searchTerms ?? [],
      currentSearchTerms: rulesetSearchTerms,
    }),
  });

  const {
    data,
    error: previewError,
    isLoading,
  } = usePreview({
    ...(selectedCategories.length && { categoryId: previewValue }),
    ...(rulesetSearchTerms.length && { searchTerm: previewValue }),
    merchandisingRules,
    facetConfig: [],
    countryCode: selectedPreviewCountryCode,
  });

  const onAddSearchTerm = (keyword: string) => {
    setRulesetSearchTerms([...rulesetSearchTerms, keyword]);

    if (!rulesetSearchTerms.length) {
      setPreviewValue(keyword);
    }

    // istanbul ignore else
    if (!hasChanges) {
      setHasChanges(true);
    }
  };

  const onRemoveSearchTerm = (keyword: string) => {
    setRulesetSearchTerms(
      rulesetSearchTerms.filter((term) => term !== keyword)
    );
  };

  /* istanbul ignore next */
  const totalCount =
    merchandisingRules.pinnedProducts.length +
    merchandisingRules.blockedProducts.length +
    (merchandisingRules.boosts?.alphanumeric || []).length +
    (merchandisingRules.boosts?.numeric || []).length +
    (merchandisingRules.boosts?.product || []).length +
    (merchandisingRules.buries?.alphanumeric || []).length +
    (merchandisingRules.buries?.numeric || []).length +
    (merchandisingRules.buries?.product || []).length +
    (merchandisingRules.includes?.alphanumeric ?? []).length +
    (merchandisingRules.excludes?.alphanumeric ?? []).length;

  const rulesPanelTabs = [
    {
      title: 'Product',
    },
    {
      title: 'Attribute',
    },
    {
      title: 'Changes',
      count: totalCount,
    },
  ];

  const createKeywordSearchRuleset = () => {
    // istanbul ignore else
    if (onCreateKeywordSearchRuleset && rulesetSearchTerms.length) {
      onCreateKeywordSearchRuleset({
        isEnabled,
        rules: merchandisingRules,
        searchTerms: rulesetSearchTerms,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
        countryCode: ruleset.countryCode,
      });
    }
  };

  const onSaveRuleset = () => {
    if (onSave && rulesetId) {
      const saveArgs = {
        ruleSetId: rulesetId,
        ruleSet: {
          facets: rulesetFacets ?? [],
          isEnabled,
          rules: merchandisingRules,
          excludedFacets: rulesetExcludedFacets,
          startDate: ruleset.startDate,
          endDate: ruleset.endDate,
          countryCode: ruleset.countryCode,
        },
        categoryIds: selectedCategories,
        ...(rulesetSearchTerms && {
          searchTerms: rulesetSearchTerms,
        }),
      };

      if (originalRuleset) {
        setPendingSave(() => () => onSave(saveArgs));
        setIsPendingConfirmation(true);
        return;
      }

      onSave(saveArgs);
    } else if (onCreate && selectedCategories.length) {
      onCreate({
        facets: [],
        isEnabled,
        rules: merchandisingRules,
        categoryIds: selectedCategories,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
        countryCode: ruleset.countryCode,
      });
    } else if (onCreateGlobalRuleset && rulesetType === 'global') {
      onCreateGlobalRuleset({
        rules: merchandisingRules,
        isEnabled: false,
        startDate: ruleset.startDate,
        endDate: ruleset.endDate,
        countryCode: ruleset.countryCode,
      });
    } else {
      createKeywordSearchRuleset();
    }
  };

  const onConfirmSave = () => {
    pendingSave?.();
    setIsPendingConfirmation(false);
    setPendingSave(null);
  };

  const onCancelSave = () => {
    setIsPendingConfirmation(false);
    setPendingSave(null);
  };

  return (
    <>
      {shouldShowPreview && (
        <Preview
          onClose={() => setShouldShowPreview(!shouldShowPreview)}
          categoryId={rulesetType === 'category' ? previewValue : undefined}
          searchTerm={rulesetType === 'search' ? previewValue : undefined}
          merchandisingRules={merchandisingRules}
          facetConfig={rulesetFacets ?? []}
          countryCode={selectedPreviewCountryCode}
        />
      )}

      <RulesetDiffModal
        isOpen={isPendingConfirmation}
        diffItems={diffItems}
        shouldShowGlobalWarning={rulesetType === 'global'}
        onConfirm={() => {
          onConfirmSave();
          setHasChanges(false);
        }}
        onCancel={onCancelSave}
      />

      <ProductGridHeader
        canSave={
          (isWriteEnabled &&
            !!selectedCategories.length &&
            merchandisingRules.pinnedProducts.length <=
              MAX_PINNED_PRODUCTS_ALLOWED) ||
          (!!rulesetSearchTerms.length &&
            merchandisingRules.pinnedProducts.length <=
              MAX_PINNED_PRODUCTS_ALLOWED) ||
          (isWriteEnabled && rulesetType === 'global')
        }
        onSave={() => {
          onSaveRuleset();
          if (!originalRuleset) {
            setHasChanges(false);
          }
        }}
        hasPreview={!!selectedCategories.length || !!rulesetSearchTerms.length}
        onPreview={() => {
          setShouldShowPreview(!shouldShowPreview);
          track({
            event: `Preview ${rulesetType} rule - ${rulesetType === 'category' ? previewValue : rulesetSearchTerms[0]}`,
          });
        }}
        hasChanges={hasUnsavedChanges}
        isNewRuleSet={
          !!onCreate ||
          !!onCreateKeywordSearchRuleset ||
          !!onCreateGlobalRuleset
        }
        onCancel={() => {
          confirmNavigation();
          onCancel();
        }}
        shouldHidePreview={rulesetType === 'global'}
        title="Product Grid"
        rulesetType={rulesetType}
        isWriteEnabled={isWriteEnabled}
        lastChanged={lastChanged}
      />

      {
        <>
          <div className={styles.categoryPanel}>
            <div className={styles.influenceWrapper}>
              <Typography as="p" hasMargin variant="labelMedium">
                Influence
              </Typography>
              <CombinedDropdown
                variant={DropdownVariant.CountrySelector}
                onChange={(country) => {
                  dispatch({
                    type: 'changeCountry',
                    payload: country as MerchandisingCountryCode,
                  });
                  track({
                    event: `Change ${rulesetType} ranking rule influence to ${country}`,
                  });
                  if (country === 'UK' && selectedPreviewCountryCode === 'IE') {
                    setSelectedPreviewCountryCode('UK');
                  }
                  if (country === 'IE' && selectedPreviewCountryCode === 'UK') {
                    setSelectedPreviewCountryCode('IE');
                  }
                }}
                ariaLabel="Select country"
                selectedCountryCode={ruleset.countryCode}
              />
            </div>

            {rulesetType !== 'global' && (
              <>
                {rulesetType === 'category' && (
                  <div className={styles.categorySearchWrapper}>
                    <CategorySearch
                      selectedCategories={selectedCategories}
                      onClearSelection={(category: string) => {
                        setSelectedCategories(
                          selectedCategories.filter(
                            (categoryName) => categoryName !== category
                          )
                        );
                        setSelectedCategoriesInfo(
                          selectedCategoriesInfo.filter(
                            (categoryInfo) => categoryInfo.id !== category
                          )
                        );
                      }}
                      onSelectCategory={onSelectCategory}
                      selectedCategoriesInfo={selectedCategoriesInfo}
                      countryCode={ruleset.countryCode}
                      previewCategory={previewValue}
                      selectPreviewCategory={(category: string | undefined) => {
                        setPreviewValue(category);
                        setSelectedPreviewCountryCode(
                          isDeprioritisedCategory(category) ? 'IE' : 'UK'
                        );
                      }}
                      isWriteEnabled={isWriteEnabled}
                    />
                  </div>
                )}

                {rulesetType === 'search' && (
                  <SearchKeywords
                    title="Search Keywords"
                    searchTerms={rulesetSearchTerms}
                    addSearchTerm={onAddSearchTerm}
                    removeSearchTerm={onRemoveSearchTerm}
                    previewSearchTerm={previewValue}
                    selectPreviewSearchTerm={setPreviewValue}
                    isWriteEnabled={isWriteEnabled}
                  />
                )}
              </>
            )}

            {rulesetType === 'global' && (
              <InfoBox text="You are currently editing all pages on the M&S website and app" />
            )}
            {rulesetType !== 'global' && (
              <div>
                <Typography as="p" hasMargin variant="labelMedium">
                  Duration
                </Typography>
                <DateTimePickerModal
                  shouldShowCalendarIcon
                  onUpdateDateTimeRange={(
                    dateTime: [Date | null, Date | null]
                  ) =>
                    dispatch({
                      type: 'dateTime',
                      payload: {
                        dateTime,
                      },
                    })
                  }
                  dateTime={[
                    ruleset.startDate ? new Date(ruleset.startDate) : null,
                    ruleset.endDate ? new Date(ruleset.endDate) : null,
                  ]}
                  isWriteEnabled={isWriteEnabled}
                />
              </div>
            )}
          </div>

          {merchandisingRules.pinnedProducts.length >
            MAX_PINNED_PRODUCTS_ALLOWED && (
            <ErrorMessage>
              Error: Please only pin 100 or fewer products
            </ErrorMessage>
          )}

          <Tabs
            tabs={rulesPanelTabs}
            onTabChange={(tab) => {
              setCurrentEditorTab(tab);
              setSelectedProducts([]);
              setSelectedSearchProducts([]);
              track({
                event: `${rulesetType} rules - ${rulesPanelTabs[tab].title} tab clicked`,
              });
            }}
            currentTab={currentEditorTab}
          />

          <div className={styles.mainContainerPanel}>
            {(currentEditorTab === 0 || currentEditorTab === 1) && (
              <>
                <div
                  className={`${styles.productSearchPanel} ${
                    rulesetType === 'global'
                      ? styles.productSearchPanelFullWidth
                      : ''
                  }`}
                >
                  <div className={styles.productSearchTabContent}>
                    {currentEditorTab === 0 && (
                      <ProductSearchAll
                        isPinnable={rulesetType !== 'global'}
                        pinnedProductsCount={
                          merchandisingRules.pinnedProducts.length
                        }
                        merchandisingRules={merchandisingRules}
                        dispatch={dispatch}
                        countryCode={ruleset.countryCode}
                        selectedProducts={selectedSearchProducts}
                        isSelectionDisabled={
                          !isWriteEnabled || !!selectedProducts.length
                        }
                        onSelectAll={setSelectedSearchProducts}
                        onSelectProduct={({ id, isSelected }) => {
                          setSelectedSearchProducts(
                            isSelected
                              ? selectedSearchProducts.filter(
                                  (product) => product !== id
                                )
                              : [...selectedSearchProducts, id]
                          );
                        }}
                        rulesetType={rulesetType}
                        categoryIds={selectedCategories}
                        searchTerms={rulesetSearchTerms}
                      />
                    )}
                    {currentEditorTab === 1 && (
                      <RulesetAttributes
                        merchandisingRules={merchandisingRules}
                        categories={selectedCategories}
                        countryCode={
                          ruleset.countryCode ??
                          // reducer always sets a country code but optional in api
                          // istanbul ignore next
                          'UK_IE'
                        }
                        dispatch={dispatch}
                        searchTerms={rulesetSearchTerms}
                        isWriteEnabled={isWriteEnabled}
                        rulesetType={rulesetType}
                      />
                    )}
                  </div>
                </div>

                {rulesetType !== 'global' && (
                  <div className={styles.visualEditorPanel}>
                    <div className={styles.panelTop}>
                      <Typography>
                        <Typography as="span" isStrong>
                          Visual Editor -{' '}
                        </Typography>
                        {previewValue}
                      </Typography>

                      {rulesetType === 'search' &&
                        ruleset.countryCode === 'UK_IE' && (
                          <div className={styles.countryPreviewWrapper}>
                            <CombinedDropdown
                              variant={DropdownVariant.Generic}
                              label={`${selectedPreviewCountryCode} view`}
                              icon={`icon-${selectedPreviewCountryCode.toLowerCase()}-flag`}
                              ariaLabel="Select country view for visual editor"
                              width={155}
                            >
                              <Button
                                className={dropdownStyles.dropdownOption}
                                data-hover-grey
                                onClick={() => {
                                  track({
                                    event:
                                      'Change search ranking rule preview to IE',
                                  });
                                  setSelectedPreviewCountryCode('IE');
                                }}
                                role="menuitemradio"
                                aria-checked={
                                  selectedPreviewCountryCode === 'IE'
                                }
                              >
                                <Image
                                  src="/trading-hub/asset/icon-ie-flag.svg"
                                  width={20}
                                  height={20}
                                  alt="IE flag"
                                />
                                &nbsp; IE view
                              </Button>
                              <Button
                                className={dropdownStyles.dropdownOption}
                                data-hover-grey
                                as="button"
                                onClick={() => {
                                  track({
                                    event:
                                      'Change search ranking rule preview to UK',
                                  });
                                  setSelectedPreviewCountryCode('UK');
                                }}
                                role="menuitemradio"
                                aria-checked={
                                  selectedPreviewCountryCode === 'UK'
                                }
                              >
                                <Image
                                  src="/trading-hub/asset/icon-uk-flag.svg"
                                  width={20}
                                  height={20}
                                  alt="UK flag"
                                />
                                &nbsp; UK view
                              </Button>
                            </CombinedDropdown>
                          </div>
                        )}
                    </div>

                    <div className={styles.tabContent}>
                      {previewError && (
                        <ErrorMessage>Error: {previewError}</ErrorMessage>
                      )}

                      {selectedCategories.length ||
                      rulesetSearchTerms.length ? (
                        <>
                          <div className={styles.productCount}>
                            <Typography as="span" variant="bodySmall">
                              {data.products.length}{' '}
                              {data.pagination.totalItems &&
                              data.pagination.totalItems > data.products.length
                                ? `out of ${data.pagination.totalItems}`
                                : ''}
                              {` algo ${pluralize(' product', data.products.length)} loaded`}
                            </Typography>
                          </div>

                          <VisualEditor
                            products={data.products}
                            dispatch={dispatch}
                            selectedProducts={selectedProducts}
                            isSelectionDisabled={
                              !isWriteEnabled || !!selectedSearchProducts.length
                            }
                            onSelectProduct={({ id, isSelected }) => {
                              setSelectedProducts(
                                isSelected
                                  ? selectedProducts.filter(
                                      (product) => product !== id
                                    )
                                  : [...selectedProducts, id]
                              );
                            }}
                          />
                        </>
                      ) : (
                        <div className={styles.textContent}>
                          <Typography>
                            No, there are no product rankings yet.
                          </Typography>
                          <Typography>
                            You need to select a category or sub-category first.
                          </Typography>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {currentEditorTab === 2 && (
              <RulesetChanges
                merchandisingRules={merchandisingRules}
                dispatch={dispatch}
                isPinnable={rulesetType !== 'global'}
                countryCode={ruleset.countryCode}
                selectedProducts={selectedProducts}
                onSelectAll={setSelectedProducts}
                onSelectProduct={({ id, isSelected }) => {
                  setSelectedProducts(
                    isSelected
                      ? selectedProducts.filter((product) => product !== id)
                      : [...selectedProducts, id]
                  );
                }}
                isSelectionDisabled={
                  !isWriteEnabled || selectedSearchProducts.length > 0
                }
              />
            )}
          </div>

          {(selectedProducts.length > 0 ||
            selectedSearchProducts.length > 0) && (
            <BulkActions
              dispatch={dispatch}
              hasRestore={selectedProducts.length > 0}
              selectedProducts={[
                ...selectedProducts,
                ...selectedSearchProducts,
              ]}
              onReset={() => {
                setSelectedProducts([]);
                setSelectedSearchProducts([]);
              }}
              ruleset={ruleset}
              rulesetType={rulesetType}
            />
          )}
        </>
      }

      {isLoading && <Loader />}
    </>
  );
};
