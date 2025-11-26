import pluralize from 'pluralize';

import { Typography } from '../typography/typography';
import styles from './filtered-results-panel.module.css';

export const FilteredResultsPanel = ({
  filteredFacets,
}: {
  filteredFacets: number;
}) => {
  return (
    <div className={styles.filteredResults}>
      <Typography variant="bodySmall" as="output">
        {filteredFacets} {pluralize(' result', filteredFacets)}
      </Typography>
    </div>
  );
};
