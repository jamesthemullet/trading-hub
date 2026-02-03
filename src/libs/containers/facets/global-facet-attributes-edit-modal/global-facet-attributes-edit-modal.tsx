import { type ActionDispatch, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import { Button, Text, Typography } from '@/libs/components';
import editFacetStyles from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.module.css';
import modalStyles from '@/libs/components/modals/modal.module.css';
import { Input } from '@/libs/containers/shared';
import { EditFacetAttributesModalTableRow } from '@/libs/containers/shared/table/table.styles';
import facetsPanelStyles from '@/libs/features/facets/facets-panel/facets-panel.module.css';
import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';
import { styled } from 'storybook/theming';

import styles from './global-facet-attributes-edit-modal.module.css';

const StyledHeading = styled(Text)`
  margin: ${spacing(1.5)};
  font-size: 20px;
`;
const StyledText = styled(Text)`
  text-decoration: underline;
  cursor: pointer;
  border: none;
  background: none;
`;

const StyledIcon = styled(Image)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
`;
const StyledError = styled(Text)`
  color: ${color.state.error.error};
  margin-top: ${spacing(0.5)};
`;
const AttributesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

const EDIT_FACET_ATTRIBUTES_MODALCOLUMNS: {
  label: string | null | false;
}[] = [
  {
    label: 'Attribute',
  },
  {
    label: 'Edit name',
  },
];

type GlobalFacetAttributesEditModalProps = {
  globalAttributesLocalState: GlobalAttributesPageState;
  dispatch: ActionDispatch<[action: GlobalAttributesPageReducer]>;
  error: string;
  handleError: (message: string) => void;
  onSave: (displayValue: string, demergedValues: string[]) => void;
};

export const GlobalFacetAttributesEditModal = ({
  globalAttributesLocalState,
  dispatch,
  error,
  handleError,
  onSave,
}: GlobalFacetAttributesEditModalProps) => {
  const {
    currentMergeValues: attributes,
    displayValue: displayName,
    isOpen,
    demergedValues,
  } = globalAttributesLocalState.currentMerge;

  // Sync local state when modal opens with new data
  useEffect(() => {
    if (isOpen) {
      dispatch({ type: 'RESET_CURRENT_MERGE_LOCAL_STATE' });
    }
  }, [isOpen, dispatch]);

  // close logic
  const handleClose = () => {
    dispatch({ type: 'CLOSE_MERGE_GROUP_MODAL' });
  };

  // save logic
  const handleSave = () => {
    onSave(value, demergedValues);
  };

  const maxVisible = 4;
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleAttributes = isExpanded
    ? attributes
    : attributes.slice(0, maxVisible);

  // name change logic
  const [value, setValue] = useState<string>(displayName);

  const handleUpdatedValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();

    if (event.target.value === '') {
      handleError('You must supply a value');
    }

    if (error && event.target.value !== '') {
      handleError('');
    }
  };

  // remove from merge logic
  const handleRemoveFromMerge = ({
    valueToRemove,
  }: {
    valueToRemove: string;
    mergeDisplayName: string;
  }) => {
    dispatch({
      type: 'ADD_DEMERGED_VALUE',
      payload: { valueToRemove },
    });

    if (attributes.length <= 1) {
      handleClose();
    }
  };

  return (
    <Modal.Root
      opened={isOpen}
      onClose={handleClose}
      centered
      size={1150}
      padding={0}
      aria-modal="true"
      aria-label="Edit facet attribute values modal"
    >
      <Modal.Overlay blur={3} />

      <Modal.Content>
        <Modal.Body>
          <div className={modalStyles.modalContainer}>
            <div className={modalStyles.modalStickyHeader}>
              <StyledHeading isStrong>Edit merge</StyledHeading>
            </div>

            <div className={modalStyles.editFacetAttributesModalTable}>
              <EditFacetAttributesModalTableRow>
                {EDIT_FACET_ATTRIBUTES_MODALCOLUMNS.map(({ label }) => (
                  <div
                    key={`edit-facet-attributes-modal-column-${label}`}
                    className={facetsPanelStyles.tableCol}
                  >
                    <Typography isStrong variant="bodySmall">
                      {label}
                    </Typography>
                  </div>
                ))}
              </EditFacetAttributesModalTableRow>

              <EditFacetAttributesModalTableRow
                data-testid={`edit attribute modal ${displayName} row`}
              >
                <div className={facetsPanelStyles.tableCol}>
                  <AttributesContainer>
                    <Text isStrong>Merged Value Group</Text>

                    {visibleAttributes.map((value, i) => (
                      <div
                        key={`${i}-${value}`}
                        className={
                          editFacetStyles.globalFacetAttributesPageMergedValue
                        }
                      >
                        <Text>{value}</Text>
                        <button
                          className={editFacetStyles.removeMergedFacet}
                          onClick={() => {
                            requestAnimationFrame(() => {
                              handleRemoveFromMerge({
                                valueToRemove: value,
                                mergeDisplayName: displayName,
                              });
                            });
                          }}
                          aria-label={`Remove merged facet for ${value}`}
                          type="button"
                        />
                      </div>
                    ))}

                    {attributes.length > maxVisible && (
                      <StyledText
                        as="button"
                        onClick={() => {
                          setIsExpanded(!isExpanded);
                        }}
                      >
                        {isExpanded ? 'Show Fewer' : 'Show More'}
                      </StyledText>
                    )}
                  </AttributesContainer>
                </div>

                <div className={facetsPanelStyles.tableCol}>
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputContainer}>
                      <Input
                        id={`Edit ${displayName} input field`}
                        ref={(inputRef) => {
                          inputRef?.focus();
                        }}
                        onChange={(event) => {
                          handleUpdatedValue(event);
                          setValue(event.target.value);
                        }}
                        placeholder="Enter merge name"
                        label=""
                        value={value}
                        aria-label={`Edit ${displayName} input field`}
                        aria-invalid={!!error}
                      />

                      {!!error && (
                        <StyledIcon
                          width={20}
                          height={20}
                          src="/trading-hub/asset/icon-warning.svg"
                          alt="edit-facet-attributes-error-icon"
                        />
                      )}
                    </div>

                    {!!error && <StyledError>{error}</StyledError>}
                  </div>
                </div>
              </EditFacetAttributesModalTableRow>
            </div>
          </div>

          <div className={modalStyles.modalFooter}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              theme="primary"
              disabled={
                Object.values(globalAttributesLocalState.errorStates).some(
                  (state) => state
                ) ||
                attributes.length <= 1 ||
                value.trim() === ''
              }
            >
              Save
            </Button>
          </div>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
