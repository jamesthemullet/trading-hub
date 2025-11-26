import { type ActionDispatch, useState } from 'react';
import { Modal } from '@mantine/core';

import { Button, Text } from '@/libs/components';
import {
  FlexColumnCol,
  GlobalFacetAttributesPageMergedValue,
  RemoveMergedFacet,
} from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { Col } from '@/libs/components/facets-panel/facets-panel.styles';
import {
  EditFacetAttributesModalTable,
  ModalStickyHeader,
} from '@/libs/components/modals/modal.styles';
import type {
  GlobalAttributesPageReducer,
  GlobalAttributesPageState,
} from '@/libs/stores/global-attributes-page/global-attributes-page-reducer';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';
import { styled } from 'storybook/theming';

import { Input } from '../shared';
import {
  EditFacetAttributesModalTableRow,
  TableHeading,
} from '../shared/table/table.styles';

const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;
const ModalFooter = styled.div`
  background-color: ${color.surface.surfaceContainer};
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: ${spacing(1)};
  display: flex;
  justify-content: flex-end;
  gap: ${spacing(2)};
  button {
    width: 160px;
  }
`;

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

const InputContainer = styled.div<{ showErrorState: boolean }>`
  position: relative;
  width: 100%;

  margin-top: ${spacing(4)};

  // input default styles override emotion so styling this way
  & > input {
    font-size: 14px;
    max-height: 2.5rem;
    border-radius: 4px;
    padding-right: 30px;
    background: ${color.surface.surface};

    ${({ showErrorState }) =>
      showErrorState && `border: 1px solid ${color.state.error.error}`};
  }
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
  onSave: (displayValue: string) => void;
};

export const GlobalFacetAttributesEditModal = ({
  globalAttributesLocalState,
  dispatch,
  error,
  handleError,
  onSave,
}: GlobalFacetAttributesEditModalProps) => {
  // close logic
  const handleClose = () => {
    dispatch({ type: 'CLOSE_MERGE_GROUP_MODAL' });
  };

  // save logic
  const handleSave = () => {
    onSave(value);
  };

  // attribute values list logic
  const attributes = globalAttributesLocalState.currentMerge.mergedValues;
  const displayName = globalAttributesLocalState.currentMerge.displayValue;

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
      type: 'REMOVE_FROM_CURRENT_MERGE',
      payload: {
        valueToRemove,
      },
    });
    if (attributes.length <= 1) {
      handleClose();
    }
  };

  return (
    <Modal.Root
      opened={globalAttributesLocalState.currentMerge.isOpen}
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
          <>
            <ModalContainer>
              <ModalStickyHeader>
                <StyledHeading isStrong>Edit merge</StyledHeading>
              </ModalStickyHeader>

              <EditFacetAttributesModalTable>
                <EditFacetAttributesModalTableRow>
                  {EDIT_FACET_ATTRIBUTES_MODALCOLUMNS.map(({ label }) => (
                    <Col key={`edit-facet-attributes-modal-column-${label}`}>
                      <TableHeading as="p" isStrong>
                        {label}
                      </TableHeading>
                    </Col>
                  ))}
                </EditFacetAttributesModalTableRow>

                <EditFacetAttributesModalTableRow
                  data-testid={`edit attribute modal ${globalAttributesLocalState.currentMerge.displayValue}`}
                >
                  <Col>
                    <AttributesContainer>
                      <Text isStrong>Merged Value Group</Text>

                      {visibleAttributes.map((value, i) => (
                        <GlobalFacetAttributesPageMergedValue
                          key={`${i}-${value}`}
                        >
                          <Text>{value}</Text>
                          <RemoveMergedFacet
                            onClick={() => {
                              requestAnimationFrame(() => {
                                handleRemoveFromMerge({
                                  valueToRemove: value,
                                  mergeDisplayName: displayName,
                                });
                              });
                            }}
                            aria-label={`Remove merged facet for ${value}`}
                          />
                        </GlobalFacetAttributesPageMergedValue>
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
                  </Col>

                  <FlexColumnCol>
                    <InputContainer showErrorState={!!error}>
                      <Input
                        id={`Edit ${globalAttributesLocalState.currentMerge.displayValue} input field`}
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
                        aria-label={`Edit ${globalAttributesLocalState.currentMerge.displayValue} input field`}
                      />

                      {!!error && (
                        <StyledIcon
                          width={20}
                          height={20}
                          src="/trading-hub/asset/icon-warning.svg"
                          alt="edit-facet-attributes-error-icon"
                        />
                      )}
                    </InputContainer>

                    {!!error && <StyledError>{error}</StyledError>}
                  </FlexColumnCol>
                </EditFacetAttributesModalTableRow>
              </EditFacetAttributesModalTable>
            </ModalContainer>

            <ModalFooter>
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
            </ModalFooter>
          </>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
