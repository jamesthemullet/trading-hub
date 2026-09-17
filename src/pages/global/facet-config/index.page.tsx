import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type {
  MerchandisingReturnedFacet,
  MerchandisingReturnedGlobalFacet,
} from '@/libs/api';
import { search } from '@/libs/api';
import {
  Button,
  ErrorMessage,
  Heading,
  Loader,
  Search,
  Typography,
} from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { RulesetDiffModal } from '@/libs/components/ruleset-diff-modal/ruleset-diff-modal';
import { ROUTES } from '@/libs/constants/routes';
import { EditableLabel } from '@/libs/containers/shared/editable-label/editable-label';
import tableStyles from '@/libs/containers/shared/table/table.module.css';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useGlobalFacetsList, useGlobalFacetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { useSaveConflict } from '@/libs/hooks/use-save-conflict';
import { createDiffItem } from '@/libs/hooks/utils/diff';
import { handleError } from '@/libs/hooks/utils/error';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import { useOnOutsideClick } from '@/libs/hooks/utils/use-on-outside-click';

import Head from 'next/head';
import Link from 'next/link';

const COLUMNS = ['Facet', 'Display Name', 'Merge Groups', ''];

type FacetConfigContentProps = {
  hasWriteAccess: boolean;
};

const FacetConfigContent = ({
  hasWriteAccess,
}: FacetConfigContentProps): ReactElement => {
  const {
    facets,
    isLoading,
    error: facetsListError,
    onRefreshFacetList,
  } = useGlobalFacetsList();

  const { handleGlobalFacetUpdate, error: updateError } =
    useGlobalFacetUpdate();

  const [displayValueOverrides, setDisplayValueOverrides] = useState<
    Record<string, string>
  >({});

  const [errorStates, setErrorStates] = useState<
    Record<string, { message: string }>
  >({});

  const [searchQuery, setSearchQuery] = useState('');
  const [optionToggle, setOptionToggle] = useState('');

  const [pendingDisplayNameChange, setPendingDisplayNameChange] = useState<{
    facet: MerchandisingReturnedFacet;
    value: string;
  } | null>(null);

  const onClose = useCallback(() => {
    setOptionToggle('');
  }, []);

  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: onClose,
  });

  const handleOptionToggle = useCallback(
    (id: string) => {
      setOptionToggle(optionToggle === id ? '' : id);
    },
    [optionToggle]
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const setError = useCallback((id: string, message: string) => {
    setErrorStates((prev) => ({
      ...Object.fromEntries(Object.entries(prev).filter(([key]) => key !== id)),
      ...(message && { [id]: { message } }),
    }));
  }, []);

  const facetsData = useMemo(
    () =>
      facets.map((facet) => {
        const overriddenDisplayValue = displayValueOverrides[facet.id];
        if (overriddenDisplayValue === undefined) return facet;
        return { ...facet, displayValue: overriddenDisplayValue };
      }),
    [facets, displayValueOverrides]
  );

  const filteredFacets = useMemo(() => {
    if (!searchQuery.trim()) return facetsData;
    const query = searchQuery.toLowerCase();
    return facetsData.filter(
      (facet) =>
        facet.displayValue.toLowerCase().includes(query) ||
        facet.indexPropertyName.toLowerCase().includes(query)
    );
  }, [facetsData, searchQuery]);

  const displayValueCountMap = useMemo(() => {
    const counts = facetsData.reduce<Record<string, number>>((acc, facet) => {
      // eslint-disable-next-line functional/immutable-data
      acc[facet.displayValue] = (acc[facet.displayValue] ?? 0) + 1;
      return acc;
    }, {});
    return new Map(Object.entries(counts));
  }, [facetsData]);

  const isDisplayValueDuplicate = useCallback(
    (facetId: string, value: string) => {
      const current = facetsData.find((f) => f.id === facetId);
      const count = displayValueCountMap.get(value) ?? 0;
      if (current?.displayValue === value) return count > 1;
      return count > 0;
    },
    [facetsData, displayValueCountMap]
  );

  const {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  } = useSaveConflict<
    MerchandisingReturnedGlobalFacet,
    { value: string; facet: MerchandisingReturnedFacet }
  >({
    save: async ({ value, facet }, versionOverride) => {
      setDisplayValueOverrides((prev) => ({ ...prev, [facet.id]: value }));

      const merged = 'merged' in facet ? facet.merged : undefined;
      let version =
        versionOverride ?? ('version' in facet ? facet.version : undefined);

      // The search-service contract marks `version` as required on every
      // returned facet, but the list endpoint currently omits it (only the
      // facet detail returns it), so recover it from the detail before the
      // optimistic-locking update. Remove once the list honours the contract.
      if (version == null) {
        try {
          const { data } = await search().getGlobalFacet(facet.id);
          version = data.version;
        } catch (err) {
          // Report the fetch failure for telemetry; version stays undefined so
          // the update below surfaces the "out of date" error to the user.
          handleError(err);
        }
      }

      const result = await handleGlobalFacetUpdate({
        facetId: facet.id,
        data: {
          displayValue: value,
          indexPropertyName: facet.indexPropertyName,
          excludedValues: facet.excludedValues,
          boosted: facet.boosted,
          merged,
        },
        version,
      });

      if (result.status === 'error') {
        setDisplayValueOverrides((prev) => ({
          ...prev,
          [facet.id]: facet.displayValue,
        }));
      }

      return result;
    },
    onSuccess: onRefreshFacetList,
  });

  const handleReviewModalClose = useCallback(() => {
    setPendingDisplayNameChange(null);
  }, []);

  const handleReviewModalConfirm = async () => {
    // istanbul ignore next -- unreachable: RulesetDiffModal (and its "Save
    // changes" button that calls this handler) only renders when
    // `opened={!!pendingDisplayNameChange}` is true, so this is only here
    // to satisfy TypeScript narrowing.
    if (!pendingDisplayNameChange) return;

    const change = pendingDisplayNameChange;
    setPendingDisplayNameChange(null);
    await runSave(change);
  };

  const displayNameDiffItems = useMemo(
    () =>
      pendingDisplayNameChange
        ? [
            createDiffItem(
              'changed',
              'Display name',
              `${pendingDisplayNameChange.facet.displayValue} → ${pendingDisplayNameChange.value}`
            ),
          ]
        : [],
    [pendingDisplayNameChange]
  );

  const conflictDiffItems = useMemo(() => {
    if (!conflict) return [];

    const original = conflict.payload.facet;
    const current = conflict.currentEntity;
    // `merged` is always an array when the key is present; the `?? 0`
    // fallback only exists to satisfy the optional field's type.
    /* istanbul ignore next */
    const getMergeCount = (facet: { merged?: unknown[] }): number =>
      facet.merged?.length ?? 0;
    const originalMergeCount =
      'merged' in original ? getMergeCount(original) : 0;
    const currentMergeCount = getMergeCount(current);

    return [
      ...(original.displayValue !== current.displayValue
        ? [
            createDiffItem(
              'changed',
              'Display name',
              `${original.displayValue} → ${current.displayValue}`
            ),
          ]
        : []),
      ...(originalMergeCount !== currentMergeCount
        ? [
            createDiffItem(
              'changed',
              'Merge groups',
              `${originalMergeCount} → ${currentMergeCount}`
            ),
          ]
        : []),
    ];
  }, [conflict]);

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Global Facet Config</title>
      </Head>

      <Heading
        breadcrumbs={['Setup', 'Global Ranking Rules']}
        title="Global Facet Configuration"
      />

      {facetsListError && (
        <ErrorMessage centred>
          Error whilst retrieving facets: {facetsListError}
        </ErrorMessage>
      )}

      {updateError && (
        <ErrorMessage centred>
          Error whilst updating facet: {updateError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <div className={styles.sectionWrapper}>
            <Typography variant="bodyMedium" hasMargin>
              Manage facet display names and merge groups. Changes here apply
              across all global rulesets.
            </Typography>

            <div className={styles.searchWrapper}>
              <Search
                name="Search facets"
                onChange={(e) => handleSearch(e.target.value.trim())}
                placeholder="Search facets"
              />
            </div>
          </div>

          <div className={styles.attributesTable}>
            <div className={styles.facetTableRow}>
              {COLUMNS.map((label) => (
                <div key={`column-${label}`} className={styles.tableCol}>
                  <Typography isStrong variant="bodySmall">
                    {label}
                  </Typography>
                </div>
              ))}
            </div>

            {filteredFacets.map((facet) => {
              const mergeCount = facet.merged?.length ?? 0;
              const errorMessage = errorStates[facet.id]?.message ?? '';
              const isOptionDropdownOpen = optionToggle === facet.id;
              const valuesUrl = (() => {
                const baseUrl = ROUTES.GLOBAL.FACET_CONFIG_VALUES(facet.id);
                const params = new URLSearchParams({
                  displayName: facet.displayValue,
                });
                return `${baseUrl}?${params.toString()}`;
              })();
              const historyUrl = (() => {
                const baseUrl = ROUTES.GLOBAL.FACET_CONFIG_HISTORY(facet.id);
                const params = new URLSearchParams({
                  displayName: facet.displayValue,
                });
                return `${baseUrl}?${params.toString()}`;
              })();

              return (
                <div
                  key={facet.id}
                  className={styles.facetTableRow}
                  data-testid={`facet-config-row-${facet.id}`}
                >
                  <div className={styles.tableCol}>
                    <Typography variant="bodySmall">
                      {facet.indexPropertyName}
                    </Typography>
                  </div>

                  <div className={styles.tableCol}>
                    {hasWriteAccess ? (
                      <EditableLabel
                        displayValue={facet.displayValue}
                        onCancel={() => setError(facet.id, '')}
                        onDisplayValueChange={(newValue) => {
                          if (newValue === facet.displayValue) return;
                          setPendingDisplayNameChange({
                            value: newValue,
                            facet,
                          });
                        }}
                        canCancelEdit
                        shouldShowErrorState={!!errorMessage}
                        setError={(message) => setError(facet.id, message)}
                        disallowedErrorMessage={errorMessage}
                        handleUpdatedValue={(event) => {
                          event.stopPropagation();
                          if (event.target.value === '') {
                            setError(facet.id, 'You must supply a value');
                          } else if (
                            isDisplayValueDuplicate(
                              facet.id,
                              event.target.value
                            )
                          ) {
                            setError(
                              facet.id,
                              `${event.target.value} is not a unique value`
                            );
                          } else {
                            setError(facet.id, '');
                          }
                        }}
                        isWriteEnabled={hasWriteAccess}
                      />
                    ) : (
                      <Typography variant="bodySmall">
                        {facet.displayValue}
                      </Typography>
                    )}
                  </div>

                  <div className={styles.tableCol}>
                    <Typography variant="bodySmall">
                      {mergeCount} merge group{mergeCount !== 1 ? 's' : ''}
                    </Typography>
                  </div>

                  <div className={styles.tableCol}>
                    <div className={tableStyles.tableActions}>
                      <Button
                        appearance="icon"
                        onMouseDown={(event: MouseEvent<HTMLButtonElement>) => {
                          event.stopPropagation();
                          handleOptionToggle(facet.id);
                        }}
                        onKeyDown={(
                          event: KeyboardEvent<HTMLButtonElement>
                        ) => {
                          if (event.key === 'Enter') {
                            event.stopPropagation();
                            handleOptionToggle(facet.id);
                          }
                          if (event.key === 'Escape' && optionToggle !== '') {
                            setOptionToggle('');
                          }
                        }}
                        aria-label="More options"
                        title="More options"
                      >
                        <span className={tableStyles.menuButton} />
                      </Button>
                      {isOptionDropdownOpen && (
                        <div
                          className={tableStyles.dropdownOptions}
                          ref={dropdownWrapperRef}
                        >
                          <Link
                            className={tableStyles.tableLink}
                            href={valuesUrl}
                          >
                            {hasWriteAccess ? 'Edit values' : 'View values'}
                          </Link>
                          <Link
                            className={tableStyles.tableLink}
                            title="view history"
                            href={historyUrl}
                          >
                            View history
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <FilteredResultsPanel filteredFacets={filteredFacets.length} />
        </>
      )}

      <RulesetDiffModal
        isOpen={!!pendingDisplayNameChange}
        diffItems={displayNameDiffItems}
        onConfirm={handleReviewModalConfirm}
        onCancel={handleReviewModalClose}
        shouldShowGlobalWarning
      />

      <ConflictModal
        opened={conflict !== null}
        entityLabel="facet"
        diffItems={conflictDiffItems}
        changedBy={conflict?.currentEntity.lastChanged.user}
        isSaving={isOverwriting}
        onOverwrite={handleOverwrite}
        onDiscard={handleDiscard}
        onClose={closeConflict}
      />
    </>
  );
};

const FacetConfig = (): ReactElement => {
  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return <FacetConfigContent hasWriteAccess={hasWriteAccess} />;
};

export default FacetConfig;
