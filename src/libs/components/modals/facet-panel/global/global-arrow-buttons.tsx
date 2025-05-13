import type { MerchandisingGlobalOnlyFacetConfig } from '@/libs/api';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';

import {
  Col,
  OrderArrowsContainer,
} from '../search-and-category/edit-facet-modal-content.styles';

type MergeGroup = MerchandisingGlobalOnlyFacetConfig['merged'];

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
};

export const GlobalArrowButtons = ({
  displayName,
  index,
  searchQuery,
  boostedValues,
  attributes,
  merged,
  rows,
  disableArrows,
  setBoostedValues,
}: {
  displayName: string;
  index: number;
  searchQuery: string;
  boostedValues: { displayValue: string }[];
  attributes: string[];
  merged: MergeGroup | undefined;
  rows: FormattedRow[];
  disableArrows: boolean;
  setBoostedValues: React.Dispatch<
    React.SetStateAction<{ displayValue: string }[]>
  >;
}) => {
  return (
    <Col>
      <OrderArrowsContainer>
        <ArrowButton
          direction="up"
          aria-label={`Move ${displayName} row up`}
          isDisabled={index === 0 || !!searchQuery || disableArrows}
          onClick={() => {
            const rowAboveIndex = boostedValues.findIndex(
              (val) => val.displayValue === attributes[0]
            );

            const rowAboveMergeGroup = merged
              ?.map((m) =>
                m.mergedValues?.includes(
                  boostedValues[rowAboveIndex - 1].displayValue
                )
                  ? m
                  : /* istanbul ignore next */
                    null
              )
              .filter(Boolean);

            const newPosition =
              rowAboveMergeGroup?.length &&
              rowAboveMergeGroup?.[0]?.mergedValues?.length
                ? boostedValues.findIndex(
                    (val) =>
                      val.displayValue ===
                      rowAboveMergeGroup?.[0]?.mergedValues?.[0]
                  )
                : rowAboveIndex - 1;

            const updatedBoostedValues = boostedValues.filter(
              (val) => !attributes.includes(val.displayValue)
            );
            setBoostedValues(
              updatedBoostedValues.toSpliced(
                newPosition,
                0,
                ...attributes.map((attr) => ({
                  displayValue: attr,
                }))
              )
            );
          }}
        />

        <ArrowButton
          direction="down"
          aria-label={`Move ${displayName} row down`}
          isDisabled={
            index === rows.length - 1 || !!searchQuery || disableArrows
          }
          onClick={() => {
            const rowBelowIndex =
              boostedValues.findIndex(
                (val) => val.displayValue === attributes.slice(-1).pop()
              ) + 1;

            const rowBelowMergeGroup = merged
              ?.map((m) =>
                m.mergedValues?.includes(
                  boostedValues[rowBelowIndex].displayValue
                )
                  ? m
                  : /* istanbul ignore next */
                    null
              )
              .filter(Boolean);

            const valueToInsertAfter =
              rowBelowMergeGroup?.[0]?.mergedValues?.slice(-1).pop() ||
              boostedValues[rowBelowIndex].displayValue;

            const updatedBoostedValues = boostedValues.filter(
              (val) => !attributes.includes(val.displayValue)
            );

            const newPosition =
              updatedBoostedValues.findIndex(
                (val) => val.displayValue === valueToInsertAfter
              ) + 1;

            setBoostedValues(
              updatedBoostedValues.toSpliced(
                newPosition,
                0,
                ...attributes.map((attr) => ({
                  displayValue: attr,
                }))
              )
            );
          }}
        />
      </OrderArrowsContainer>
    </Col>
  );
};
