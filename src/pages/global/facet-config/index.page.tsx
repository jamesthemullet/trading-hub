import type { ReactElement } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { MerchandisingReturnedFacet } from '@/libs/api';
import {
  Button,
  ErrorMessage,
  Heading,
  Loader,
  Search,
  Typography,
} from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { ROUTES } from '@/libs/constants/routes';
import { EditableLabel } from '@/libs/containers/shared/editable-label/editable-label';
import styles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import { useGlobalFacetsList, useGlobalFacetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const COLUMNS = ['Facet', 'Display Name', 'Merge Groups', ''];

const FacetConfig = (): ReactElement => {
  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  const { facets, isLoading, error: facetsListError } = useGlobalFacetsList();

  const { handleGlobalFacetUpdate, error: updateError } =
    useGlobalFacetUpdate();

  const [displayValueOverrides, setDisplayValueOverrides] = useState<
    Record<string, string>
  >({});

  const [errorStates, setErrorStates] = useState<
    Record<string, { message: string }>
  >({});

  const [searchQuery, setSearchQuery] = useState('');

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

  const onFacetDataChange = async ({
    value,
    facet,
  }: {
    value: string;
    facet: MerchandisingReturnedFacet;
  }) => {
    setDisplayValueOverrides((prev) => ({ ...prev, [facet.id]: value }));

    const merged = 'merged' in facet ? facet.merged : undefined;

    const response = await handleGlobalFacetUpdate({
      facetId: facet.id,
      data: {
        displayValue: value,
        indexPropertyName: facet.indexPropertyName,
        excludedValues: facet.excludedValues,
        boosted: facet.boosted,
        merged,
      },
    });

    if (response && 'status' in response && response.status === 'error') {
      setDisplayValueOverrides((prev) => ({
        ...prev,
        [facet.id]: facet.displayValue,
      }));
    }
  };

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

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
                        onDisplayValueChange={(newValue) =>
                          onFacetDataChange({ value: newValue, facet })
                        }
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
                    <Button
                      theme="secondary"
                      as="a"
                      href={(() => {
                        const baseUrl = ROUTES.GLOBAL.FACET_CONFIG_VALUES(
                          facet.id
                        );
                        const params = new URLSearchParams({
                          displayName: facet.displayValue,
                        });
                        return `${baseUrl}?${params.toString()}`;
                      })()}
                    >
                      {hasWriteAccess ? 'Edit values' : 'View values'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <FilteredResultsPanel filteredFacets={filteredFacets.length} />
        </>
      )}
    </>
  );
};

export default FacetConfig;
