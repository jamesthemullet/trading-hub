import styled from '@emotion/styled';

import pluralize from 'pluralize';

import { spacing } from '../utils/spacing';

const FilteredResults = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: ${spacing(4)};
  margin-left: auto;
  margin-right: ${spacing(2)};
  margin-bottom: ${spacing(4)};
  font-weight: 400;
  font-size: 14px;
`;

const TotalResultsLabel = styled.div`
  font-family: mnsLondonRegular, monospace;
  margin-left: 31px;
`;

export const FilteredResultsPanel = ({
  filteredFacets,
}: {
  filteredFacets: number;
}) => {
  return (
    <FilteredResults>
      <TotalResultsLabel>
        {filteredFacets} {pluralize(' result', filteredFacets)}
      </TotalResultsLabel>
    </FilteredResults>
  );
};
