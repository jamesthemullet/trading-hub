import pluralize from 'pluralize';

import styles from './filtered-results-panel.module.css';

export const FilteredResultsPanel = ({
  filteredFacets,
}: {
  filteredFacets: number;
}) => {
  return (
    <div className={styles.filteredResults}>
      <output className={styles.totalResultsLabel}>
        {filteredFacets} {pluralize(' result', filteredFacets)}
      </output>
    </div>
  );
};
