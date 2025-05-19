import type { Dispatch } from 'react';

import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';

import { OrderArrowsContainer } from '../search-and-category/edit-facet-modal-content.styles';
import type { GlobalAttributeReducer } from './global-attribute-reducer';

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
};

export const GlobalArrowButtons = ({
  displayName,
  index,
  searchQuery,
  boostedRows,
  attributes,
  rows,
  disableArrows,
  dispatch,
}: {
  displayName: string;
  index: number;
  searchQuery: string;
  boostedRows: FormattedRow[];
  attributes: string[];
  rows: FormattedRow[];
  disableArrows: boolean;
  dispatch: Dispatch<GlobalAttributeReducer>;
}) => {
  return (
    <OrderArrowsContainer>
      <ArrowButton
        direction="up"
        aria-label={`Move ${displayName} row up`}
        isDisabled={index === 0 || !!searchQuery || disableArrows}
        onClick={() => {
          const rowsAboveIndex = boostedRows.findIndex((val) =>
            val.attributes.includes(attributes[0])
          );

          const newPosition = rowsAboveIndex - 1;

          const updatedBoostedValues = boostedRows.filter(
            (val) => !val.attributes.includes(attributes[0])
          );

          const rowToMove = boostedRows.find((val) =>
            val.attributes.includes(attributes[0])
          );

          dispatch({
            type: 'CHANGE_ROW_ORDER',
            payload: {
              newOrder: updatedBoostedValues.toSpliced(
                newPosition,
                0,
                rowToMove!
              ),
            },
          });
        }}
      />

      <ArrowButton
        direction="down"
        aria-label={`Move ${displayName} row down`}
        isDisabled={index === rows.length - 1 || !!searchQuery || disableArrows}
        onClick={() => {
          const rowBelowIndex = boostedRows.findIndex((val) =>
            val.attributes.includes(attributes[0])
          );

          const updatedBoostedValues = boostedRows.filter(
            (val) => !val.attributes.includes(attributes[0])
          );

          const newPosition = rowBelowIndex + 1;

          const rowToMove = boostedRows.find((val) =>
            val.attributes.includes(attributes[0])
          );

          dispatch({
            type: 'CHANGE_ROW_ORDER',
            payload: {
              newOrder: updatedBoostedValues.toSpliced(
                newPosition,
                0,
                rowToMove!
              ),
            },
          });
        }}
      />
    </OrderArrowsContainer>
  );
};
