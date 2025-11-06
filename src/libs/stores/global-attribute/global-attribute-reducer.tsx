type FacetDisplayType = 'included' | 'algoControl' | 'excluded';

export type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
  order?: number;
  isChecked: boolean;
};

type FormattedBoostedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
  isChecked: boolean;
  order: number;
};

type ToggleAllAttributes = {
  type: 'TOGGLE_ALL_ATTRIBUTES';
  payload: {
    allSelected: boolean;
  };
};

type ToggleSelectedAttribute = {
  type: 'TOGGLE_SELECTED_ATTRIBUTE';
  payload: {
    displayName: string;
  };
};

type AmendDisplayName = {
  type: 'AMEND_DISPLAY_NAME';
  payload: {
    oldValue: string;
    newValue: string;
  };
};

type AmendBoostedRow = {
  type: 'AMEND_BOOSTED_ROW';
  payload: {
    displayName: string;
    newStatus: FacetDisplayType;
  };
};

type AmendNonBoostedExcludedRow = {
  type: 'AMEND_NONBOOSTEDEXCLUDED_ROW';
  payload: {
    displayName: string;
    newStatus: FacetDisplayType;
  };
};

type AmendExcludedRow = {
  type: 'AMEND_EXCLUDED_ROW';
  payload: {
    displayName: string;
    newStatus: FacetDisplayType;
  };
};

type InitialiseState = {
  type: 'INITIALISE_STATE';
  payload: {
    boostedValues: { displayValue: string }[];
    nonBoostedExcludedValues: { displayValue: string }[];
    excludedValues: { displayValue: string }[];
    merged: {
      displayValue?: string;
      mergedValues?: string[];
    }[];
  };
};

type ChangeRowOrder = {
  type: 'CHANGE_ROW_ORDER';
  payload: {
    newOrder: FormattedRow[];
  };
};

type CreateMergeGroup = {
  type: 'CREATE_MERGE_GROUP';
  payload: {
    attributes: string[];
    isFirstAttributeBoosted?: boolean;
    isFirstAttributeExcluded?: boolean;
  };
};

type UpdateMergeGroup = {
  type: 'UPDATE_MERGE_GROUP';
  payload: {
    attributes: string[];
    isFirstAttributeBoosted: boolean;
    isFirstAttributeExcluded: boolean;
  };
};

type RemoveFromMergeGroup = {
  type: 'REMOVE_FROM_MERGE_GROUP';
  payload: {
    valueToRemove: string;
    mergeDisplayName: string;
  };
};

type SetError = {
  type: 'SET_ERROR';
  payload: {
    displayName: string;
    message: string;
  };
};

type SetBoostedOrderAction = {
  type: 'SET_BOOSTED_ORDER';
  payload: {
    id: string;
    newIndex: number;
  };
};

export type GlobalAttributeReducer =
  | ToggleAllAttributes
  | ToggleSelectedAttribute
  | AmendDisplayName
  | InitialiseState
  | AmendBoostedRow
  | AmendNonBoostedExcludedRow
  | AmendExcludedRow
  | ChangeRowOrder
  | CreateMergeGroup
  | UpdateMergeGroup
  | RemoveFromMergeGroup
  | SetError
  | SetBoostedOrderAction;

export type GlobalAttributesState = {
  boostedRows: FormattedBoostedRow[];
  nonBoostedExcludedRows: FormattedRow[];
  excludedRows: FormattedRow[];
  merged: {
    displayValue?: string;
    mergedValues?: string[];
  }[];
  errorStates: {
    [key: string]: string;
  };
};

export const globalAttributesReducer = (
  state: GlobalAttributesState,
  action: GlobalAttributeReducer
): GlobalAttributesState => {
  switch (action.type) {
    case 'TOGGLE_ALL_ATTRIBUTES': {
      const { allSelected } = action.payload;

      return {
        ...state,
        boostedRows: state.boostedRows.map((row) => ({
          ...row,
          isChecked: !!allSelected,
        })),
        excludedRows: state.excludedRows.map((row) => ({
          ...row,
          isChecked: !!allSelected,
        })),
        nonBoostedExcludedRows: state.nonBoostedExcludedRows.map((row) => ({
          ...row,
          isChecked: !!allSelected,
        })),
      };
    }

    case 'TOGGLE_SELECTED_ATTRIBUTE': {
      const { displayName } = action.payload;

      const updatedBoostedRows = state.boostedRows.map((row) =>
        row.displayName === displayName
          ? { ...row, isChecked: !row.isChecked }
          : row
      );

      const updatedExcludedRows = state.excludedRows.map((row) =>
        row.displayName === displayName
          ? { ...row, isChecked: !row.isChecked }
          : row
      );

      const updatedNonBoostedExcludedRows = state.nonBoostedExcludedRows.map(
        (row) =>
          row.displayName === displayName
            ? { ...row, isChecked: !row.isChecked }
            : row
      );

      return {
        ...state,
        boostedRows: updatedBoostedRows,
        excludedRows: updatedExcludedRows,
        nonBoostedExcludedRows: updatedNonBoostedExcludedRows,
      };
    }

    case 'AMEND_DISPLAY_NAME': {
      const { oldValue, newValue } = action.payload;
      const updatedBoostedRows = state.boostedRows.map((row) =>
        row.displayName === oldValue ? { ...row, displayName: newValue } : row
      );

      const updatedExcludedRows = state.excludedRows.map((row) =>
        row.displayName === oldValue ? { ...row, displayName: newValue } : row
      );
      const updatedNonBoostedExcludedRows = state.nonBoostedExcludedRows.map(
        (row) =>
          row.displayName === oldValue ? { ...row, displayName: newValue } : row
      );

      const updatedMerged = state.merged?.map((merge) => {
        if (merge.displayValue === oldValue) {
          return {
            ...merge,
            displayValue: newValue,
          };
        }

        return merge;
      });

      return {
        ...state,
        boostedRows: updatedBoostedRows,
        excludedRows: updatedExcludedRows,
        nonBoostedExcludedRows: updatedNonBoostedExcludedRows,
        merged: updatedMerged,
      };
    }

    case 'INITIALISE_STATE': {
      const {
        boostedValues,
        nonBoostedExcludedValues,
        excludedValues,
        merged,
      } = action.payload;

      const formatRow = (row: { displayValue: string }): FormattedRow => {
        const match = merged.find(
          (merge) =>
            merge.mergedValues?.includes(row.displayValue) ||
            merge.displayValue === row.displayValue
        );

        return match?.displayValue && match.mergedValues
          ? {
              displayName: match.displayValue,
              attributes: match.mergedValues,
              isMergeGroup: true,
              isChecked: false,
            }
          : {
              displayName: row.displayValue,
              attributes: [row.displayValue],
              isMergeGroup: false,
              isChecked: false,
            };
      };

      const getUniqueRows = (
        rows: FormattedRow[],
        ...excludes: FormattedRow[][]
      ): FormattedRow[] => {
        return rows.filter((row, index, self) => {
          const isUnique =
            index === self.findIndex((r) => r.displayName === row.displayName);
          const isExcluded = excludes.some((group) =>
            group.some(
              (ex) =>
                ex.attributes.includes(row.displayName) ||
                ex.displayName === row.displayName
            )
          );
          return isUnique && !isExcluded;
        });
      };

      const updatedBoostedRows = boostedValues.map(formatRow);
      const updatedExcludedRows = excludedValues.map(formatRow);
      const updatedNonBoostedExcludedRows =
        nonBoostedExcludedValues.map(formatRow);

      const uniqueBoostedRows = getUniqueRows(updatedBoostedRows);

      const uniqueBoostedRowsWithOrder = uniqueBoostedRows.map(
        (row, index) => ({
          ...row,
          order: index + 1,
        })
      );

      const uniqueExcludedRows = getUniqueRows(
        updatedExcludedRows,
        uniqueBoostedRows
      );

      const uniqueNonBoostedExcludedRows = getUniqueRows(
        updatedNonBoostedExcludedRows,
        uniqueBoostedRows,
        uniqueExcludedRows
      );

      return {
        ...state,
        boostedRows: uniqueBoostedRowsWithOrder,
        nonBoostedExcludedRows: uniqueNonBoostedExcludedRows,
        excludedRows: uniqueExcludedRows,
        merged,
      };
    }

    case 'AMEND_BOOSTED_ROW': {
      const { newStatus, displayName } = action.payload;
      const found = state.boostedRows.find(
        (row) => row.displayName === displayName
      )!;

      const rowToMove = {
        displayName: found.displayName,
        attributes: found.attributes,
        isMergeGroup: found.isMergeGroup,
        isChecked: found.isChecked,
      };
      return {
        ...state,
        boostedRows: state.boostedRows
          .filter((row) => row.displayName !== displayName)
          .map((row, index) => ({
            ...row,
            order: index + 1,
          })),
        excludedRows:
          newStatus === 'excluded'
            ? [...state.excludedRows, rowToMove]
            : state.excludedRows,
        nonBoostedExcludedRows:
          newStatus === 'algoControl'
            ? [...state.nonBoostedExcludedRows, rowToMove]
            : state.nonBoostedExcludedRows,
      };
    }

    case 'AMEND_NONBOOSTEDEXCLUDED_ROW': {
      const { newStatus, displayName } = action.payload;
      const rowToMove = state.nonBoostedExcludedRows.find(
        (row) => row.displayName === displayName
      );

      return {
        ...state,
        nonBoostedExcludedRows: state.nonBoostedExcludedRows.filter(
          (row) => row.displayName !== displayName
        ),
        excludedRows:
          newStatus === 'excluded'
            ? [...state.excludedRows, rowToMove!]
            : state.excludedRows,
        boostedRows:
          newStatus === 'included'
            ? [
                ...state.boostedRows,
                { ...rowToMove!, order: state.boostedRows.length + 1 },
              ]
            : state.boostedRows,
      };
    }

    case 'AMEND_EXCLUDED_ROW': {
      const { newStatus, displayName } = action.payload;
      const rowToMove = state.excludedRows.find(
        (row) => row.displayName === displayName
      );

      return {
        ...state,
        excludedRows: state.excludedRows.filter(
          (row) => row.displayName !== displayName
        ),
        boostedRows:
          newStatus === 'included'
            ? [
                ...state.boostedRows,
                { ...rowToMove!, order: state.boostedRows.length + 1 },
              ]
            : state.boostedRows,
        nonBoostedExcludedRows:
          newStatus === 'algoControl'
            ? [...state.nonBoostedExcludedRows, rowToMove!]
            : state.nonBoostedExcludedRows,
      };
    }

    case 'CHANGE_ROW_ORDER': {
      const { newOrder } = action.payload;
      return {
        ...state,
        boostedRows: newOrder.map((row, index) => {
          return {
            ...row,
            order: index + 1,
          };
        }),
      };
    }

    case 'CREATE_MERGE_GROUP': {
      const { attributes } = action.payload;

      const boostedRowsToMerge = state.boostedRows.filter((row) =>
        attributes.includes(row.displayName)
      );

      const excludedRowsToMerge = state.excludedRows.filter((row) =>
        attributes.includes(row.displayName)
      );
      const nonBoostedExcludedRowsToMerge = state.nonBoostedExcludedRows.filter(
        (row) => attributes.includes(row.displayName)
      );

      const newMergeGroup: FormattedRow = {
        attributes: [
          ...boostedRowsToMerge.map((row) => row.attributes),
          ...excludedRowsToMerge.map((row) => row.attributes),
          ...nonBoostedExcludedRowsToMerge.map((row) => row.attributes),
        ].flat(),
        displayName: attributes[0],
        isMergeGroup: true,
        isChecked: false,
      };

      const filteredBoostedRows = state.boostedRows.map((row) => {
        if (attributes.includes(row.displayName)) {
          return newMergeGroup;
        } else {
          return row;
        }
      });

      const uniqueBoostedRows = filteredBoostedRows.filter(
        (row, index, self) =>
          index === self.findIndex((r) => r.displayName === row.displayName)
      );

      const filteredNonBoostedExcludedRows = state.nonBoostedExcludedRows.map(
        (row) => {
          if (attributes.includes(row.displayName)) {
            return newMergeGroup;
          } else {
            return row;
          }
        }
      );

      const uniqueNonBoostedExcludedRows =
        filteredNonBoostedExcludedRows.filter(
          (row, index, self) =>
            index ===
              self.findIndex((r) => r.displayName === row.displayName) &&
            !uniqueBoostedRows.some(
              (boostedRow) => boostedRow.displayName === row.displayName
            )
        );

      const filteredExcludedRows = state.excludedRows.map((row) => {
        if (attributes.includes(row.displayName)) {
          return newMergeGroup;
        } else {
          return row;
        }
      });

      const uniqueExcludedRows = filteredExcludedRows.filter(
        (row, index, self) =>
          index === self.findIndex((r) => r.displayName === row.displayName) &&
          !uniqueBoostedRows.some(
            (boostedRow) => boostedRow.displayName === row.displayName
          ) &&
          !uniqueNonBoostedExcludedRows.some(
            (boostedRow) => boostedRow.displayName === row.displayName
          )
      );

      return {
        ...state,
        boostedRows: uniqueBoostedRows.map((row, index) => {
          return {
            ...row,
            order: index + 1,
          };
        }),
        excludedRows: uniqueExcludedRows,
        nonBoostedExcludedRows: uniqueNonBoostedExcludedRows,
        merged: [
          ...state.merged,
          {
            displayValue: newMergeGroup.displayName,
            mergedValues: newMergeGroup.attributes,
          },
        ],
      };
    }

    case 'UPDATE_MERGE_GROUP': {
      const { attributes, isFirstAttributeBoosted, isFirstAttributeExcluded } =
        action.payload;

      const boostedRowsWithoutMergeGroup = state.boostedRows.filter((row) =>
        row.attributes.some((val) => !attributes.includes(val))
      );

      const excludedRowsWithoutMergeGroup = state.excludedRows.filter((row) =>
        row.attributes.some((val) => !attributes.includes(val))
      );

      const nonBoostedExcludedRowsWithoutMergeGroup =
        state.nonBoostedExcludedRows.filter((row) =>
          row.attributes.some((val) => !attributes.includes(val))
        );

      const updatedMerged = state.merged.filter((merge) => {
        const hasMatchingValues = merge.mergedValues!.some((value) =>
          attributes.includes(value)
        );

        if (hasMatchingValues) {
          return false;
        }

        return true;
      });

      const newMergeGroup: FormattedRow = {
        attributes,
        displayName: attributes[0],
        isMergeGroup: true,
        isChecked: false,
      };

      return {
        ...state,
        boostedRows: isFirstAttributeBoosted
          ? [newMergeGroup, ...boostedRowsWithoutMergeGroup].map(
              (row, index) => {
                return {
                  ...row,
                  order: index + 1,
                };
              }
            )
          : boostedRowsWithoutMergeGroup.map((row, index) => {
              return {
                ...row,
                order: index + 1,
              };
            }),
        excludedRows: isFirstAttributeExcluded
          ? [newMergeGroup, ...excludedRowsWithoutMergeGroup]
          : excludedRowsWithoutMergeGroup,
        nonBoostedExcludedRows:
          !isFirstAttributeBoosted && !isFirstAttributeExcluded
            ? [newMergeGroup, ...nonBoostedExcludedRowsWithoutMergeGroup]
            : nonBoostedExcludedRowsWithoutMergeGroup,
        merged: [
          ...updatedMerged,
          {
            displayValue: newMergeGroup.displayName,
            mergedValues: newMergeGroup.attributes,
          },
        ],
      };
    }

    case 'REMOVE_FROM_MERGE_GROUP': {
      const { valueToRemove, mergeDisplayName } = action.payload;

      const originalMergeGroup = state.merged.find(
        (merge) => merge.displayValue === mergeDisplayName
      );

      const remainingValues = originalMergeGroup?.mergedValues?.filter(
        (val) => val !== valueToRemove
      );

      let rowsToRecreate = [];

      if (remainingValues?.length === 1) {
        rowsToRecreate = [
          {
            displayName: remainingValues[0],
            attributes: [remainingValues[0]],
            isMergeGroup: false,
            isChecked: false,
          },
          {
            displayName: valueToRemove,
            attributes: [valueToRemove],
            isMergeGroup: false,
            isChecked: false,
          },
        ];
      } else {
        rowsToRecreate = [
          {
            displayName: valueToRemove,
            attributes: [valueToRemove],
            isMergeGroup: false,
            isChecked: false,
          },
        ];
      }

      const updatedMerged = state.merged.map((merge) => {
        if (merge.displayValue === mergeDisplayName) {
          return {
            ...merge,
            mergedValues: merge.mergedValues!.filter(
              (val) => val !== valueToRemove
            ),
          };
        }
        return merge;
      });

      const shouldRemoveWholeMergeRow = remainingValues?.length === 1;

      const updatedBoostedRows = state.boostedRows.flatMap((row) => {
        if (row.displayName === mergeDisplayName) {
          if (shouldRemoveWholeMergeRow) return [...rowsToRecreate];
          return [
            {
              ...row,
              attributes: row.attributes.filter((val) => val !== valueToRemove),
            },
            ...rowsToRecreate,
          ];
        }
        return [row];
      });

      const updatedExcludedRows = state.excludedRows.flatMap((row) => {
        if (row.displayName === mergeDisplayName) {
          if (shouldRemoveWholeMergeRow) return [...rowsToRecreate];
          return [
            {
              ...row,
              attributes: row.attributes.filter((val) => val !== valueToRemove),
            },
            ...rowsToRecreate,
          ];
        }
        return [row];
      });

      const updatedNonBoostedExcludedRows =
        state.nonBoostedExcludedRows.flatMap((row) => {
          if (row.displayName === mergeDisplayName) {
            if (shouldRemoveWholeMergeRow) return [...rowsToRecreate];
            return [
              {
                ...row,
                attributes: row.attributes.filter(
                  (val) => val !== valueToRemove
                ),
              },
              ...rowsToRecreate,
            ];
          }
          return [row];
        });

      return {
        ...state,
        boostedRows: updatedBoostedRows.map((row, index) => {
          return {
            ...row,
            order: index + 1,
          };
        }),
        excludedRows: updatedExcludedRows,
        nonBoostedExcludedRows: updatedNonBoostedExcludedRows,
        merged: updatedMerged.filter((merge) => merge.mergedValues!.length > 1),
      };
    }
    case 'SET_ERROR': {
      const { displayName, message } = action.payload;

      const updatedErrorStates = { ...state.errorStates };

      if (message === '') {
        delete updatedErrorStates[displayName];
      } else {
        updatedErrorStates[displayName] = message;
      }

      return {
        ...state,
        errorStates: updatedErrorStates,
      };
    }

    case 'SET_BOOSTED_ORDER': {
      const currentBoosted = state.boostedRows;
      const currentIndex = currentBoosted.findIndex(
        (item) => item.displayName === action.payload.id
      );
      const newIndex = action.payload.newIndex;

      const item = currentBoosted[currentIndex];
      const withoutItem = currentBoosted.toSpliced(currentIndex, 1);
      const newBoostedArray = withoutItem.toSpliced(newIndex, 0, item);

      return {
        ...state,
        boostedRows: newBoostedArray.map((row, index) => ({
          ...row,
          order: index + 1,
        })),
      };
    }
  }
};
