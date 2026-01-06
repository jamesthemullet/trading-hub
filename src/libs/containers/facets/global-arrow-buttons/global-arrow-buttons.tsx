import { type Dispatch, useEffect, useState } from 'react';

import { Loader } from '@/libs/components';
import { ArrowButton } from '@/libs/components/arrow-button/arrow-button';
import { OrderArrowsContainer } from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import type { GlobalAttributeReducer } from '@/libs/stores/global-attribute/global-attribute-reducer';

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
  isChecked: boolean;
};

export const GlobalArrowButtons = ({
  displayName,
  index,
  searchQuery,
  boostedRows,
  attributes,
  rows,
  disableArrows,
  writeEnabled,
  dispatch,
}: {
  displayName: string;
  index: number;
  searchQuery: string;
  boostedRows: FormattedRow[];
  attributes: string[];
  rows: FormattedRow[];
  disableArrows: boolean;
  writeEnabled?: boolean;
  dispatch: Dispatch<GlobalAttributeReducer>;
}) => {
  const [isAwaitingUpdate, setIsAwaitingUpdate] = useState(false);

  useEffect(() => {
    if (!isAwaitingUpdate) return;

    setIsAwaitingUpdate(false);
  }, [isAwaitingUpdate]);

  return (
    <OrderArrowsContainer>
      <ArrowButton
        direction="up"
        label={`Move ${displayName} row up`}
        isDisabled={
          index === 0 || !!searchQuery || disableArrows || !writeEnabled
        }
        onClick={() => {
          setIsAwaitingUpdate(true);
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

          requestAnimationFrame(() => {
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
          });
        }}
      />

      <ArrowButton
        direction="down"
        label={`Move ${displayName} row down`}
        isDisabled={
          index === rows.length - 1 ||
          !!searchQuery ||
          disableArrows ||
          !writeEnabled
        }
        onClick={() => {
          setIsAwaitingUpdate(true);
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

          requestAnimationFrame(() => {
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
          });
        }}
      />
      {isAwaitingUpdate && <Loader isInModal />}
    </OrderArrowsContainer>
  );
};
