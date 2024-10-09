import styled from '@emotion/styled';
import { Dispatch, useState } from 'react';
import { Modal } from '@mantine/core';

import {
  AlphanumericBoostBury,
  IncludeExclude,
  MerchandisingRules,
  NumericBoostBury,
} from '@/libs/api';

import pluralize from 'pluralize';

import { Button } from '../buttons/button/button';
import { Action, RulesetAttribute } from '../types';
import { Label } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import { AddSetAttribute } from './add-set-attribute';
import { AlphanumericAttribute } from './alphanumeric-attribute';
import { NumericAttribute } from './numeric-attribute';
import { AttributeCount } from './ruleset-attributes.styles';

const MODAL_WIDTH = 435;

const Wrapper = styled.div`
  position: relative;
`;

const Icon = styled.img`
  margin-right: ${spacing(1)};
  margin-bottom: -2px;
`;

const CreateNew = styled(Button)`
  width: auto;
  margin: ${spacing(3)} auto;
  display: block;
`;

const InsetLabel = styled(Label)`
  margin-left: ${spacing(1)};
`;

const RuleSetAttributesContainer = styled.div`
  height: calc(100vh - 375px);
  overflow-y: auto;
  padding-right: ${spacing(1)};
`;

export type Props = {
  category?: string;
  searchTerms?: string[];
  merchandisingRules: MerchandisingRules;
  dispatch: Dispatch<Action>;
};

export const RulesetAttributes = ({
  category,
  merchandisingRules,
  dispatch,
  searchTerms,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  /* istanbul ignore next */
  const countOfAttributeChanges =
    (merchandisingRules.boosts.numeric.length ?? 0) +
    (merchandisingRules.boosts.alphanumeric.length ?? 0) +
    (merchandisingRules.buries.numeric.length ?? 0) +
    (merchandisingRules.buries.alphanumeric.length ?? 0) +
    (merchandisingRules.includes.alphanumeric?.length ?? 0) +
    (merchandisingRules.excludes.alphanumeric?.length ?? 0);
  /* istanbul ignore next */
  const numericBoosts = merchandisingRules.boosts.numeric ?? [];
  /* istanbul ignore next */
  const alphanumericBoost = merchandisingRules.boosts.alphanumeric ?? [];
  /* istanbul ignore next */
  const numericBury = merchandisingRules.buries.numeric ?? [];
  /* istanbul ignore next */
  const alphanumericBuries = merchandisingRules.buries.alphanumeric ?? [];
  /* istanbul ignore next */
  const alphanumericIncludes = merchandisingRules.includes.alphanumeric ?? [];
  /* istanbul ignore next */
  const alphanumericExcludes = merchandisingRules.excludes.alphanumeric ?? [];

  return (
    <Wrapper>
      <CreateNew onClick={() => setIsModalOpen(!isModalOpen)}>
        <Icon alt="" src="/trading-hub/asset/icon-plus-simple.svg" />
        Create new attribute rule
      </CreateNew>
      {countOfAttributeChanges > 0 && (
        <RuleSetAttributesContainer aria-label="Ruleset attributes">
          <AttributeCount>
            {countOfAttributeChanges} attribute{' '}
            {pluralize('rule', countOfAttributeChanges)}
          </AttributeCount>
          {(!!alphanumericBoost.length || !!alphanumericBuries.length) && (
            <InsetLabel isStrong withMargin as="h3">
              Product Description Attribute Rules
            </InsetLabel>
          )}
          {!!alphanumericBoost.length &&
            alphanumericBoost.map(({ fields, weight }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="boost"
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    dispatch({
                      type: 'alphanumericBoostBuryAttribute',
                      payload: {
                        change: 'modify',
                        operation: 'boost',
                        index,
                        data: {
                          fields,
                          weight: newWeight,
                        },
                      },
                    })
                }
                onDelete={({ fields, weight }: AlphanumericBoostBury) =>
                  dispatch({
                    type: 'alphanumericBoostBuryAttribute',
                    payload: {
                      change: 'remove',
                      operation: 'boost',
                      index,
                      data: {
                        fields,
                        weight,
                      },
                    },
                  })
                }
              />
            ))}

          {!!alphanumericBuries.length &&
            alphanumericBuries.map(({ fields, weight }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="bury"
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    dispatch({
                      type: 'alphanumericBoostBuryAttribute',
                      payload: {
                        change: 'modify',
                        operation: 'bury',
                        index,
                        data: {
                          fields,
                          weight: newWeight,
                        },
                      },
                    })
                }
                onDelete={({ fields, weight }: AlphanumericBoostBury) =>
                  dispatch({
                    type: 'alphanumericBoostBuryAttribute',
                    payload: {
                      change: 'remove',
                      operation: 'bury',
                      index,
                      data: {
                        fields,
                        weight,
                      },
                    },
                  })
                }
              />
            ))}

          {!!alphanumericIncludes.length &&
            alphanumericIncludes.map(({ fields }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="include"
                onDelete={({ fields }: IncludeExclude) =>
                  dispatch({
                    type: 'alphanumericIncludeExcludeAttribute',
                    payload: {
                      change: 'remove',
                      operation: 'include',
                      index,
                      data: {
                        fields,
                      },
                    },
                  })
                }
              />
            ))}

          {!!alphanumericExcludes.length &&
            alphanumericExcludes.map(({ fields }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="exclude"
                onDelete={({ fields }: IncludeExclude) =>
                  dispatch({
                    type: 'alphanumericIncludeExcludeAttribute',
                    payload: {
                      change: 'remove',
                      operation: 'exclude',
                      index,
                      data: {
                        fields,
                      },
                    },
                  })
                }
              />
            ))}

          {(!!numericBoosts.length || !!numericBury.length) && (
            <InsetLabel isStrong withMargin as="h3">
              Numeric Attribute Rules
            </InsetLabel>
          )}
          {!!numericBoosts.length &&
            numericBoosts.map(({ field, weight }, index) => (
              <NumericAttribute
                key={field}
                isEditable
                operation="boost"
                name={field}
                weight={weight}
                onChangeAttribute={({ newWeight }: { newWeight: number }) =>
                  dispatch({
                    type: 'numericAttribute',
                    payload: {
                      change: 'modify',
                      operation: 'boost',
                      index,
                      data: {
                        field,
                        weight: newWeight,
                      },
                    },
                  })
                }
                onDelete={({ field, weight }: NumericBoostBury) =>
                  dispatch({
                    type: 'numericAttribute',
                    payload: {
                      change: 'remove',
                      operation: 'boost',
                      index,
                      data: {
                        field,
                        weight,
                      },
                    },
                  })
                }
              />
            ))}
          {!!numericBury.length &&
            numericBury.map(({ field, weight }, index) => (
              <NumericAttribute
                key={field}
                isEditable
                operation="bury"
                name={field}
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    dispatch({
                      type: 'numericAttribute',
                      payload: {
                        change: 'modify',
                        operation: 'bury',
                        index,
                        data: {
                          field,
                          weight: newWeight,
                        },
                      },
                    })
                }
                onDelete={({ field, weight }: NumericBoostBury) =>
                  dispatch({
                    type: 'numericAttribute',
                    payload: {
                      change: 'remove',
                      operation: 'bury',
                      index,
                      data: {
                        field,
                        weight,
                      },
                    },
                  })
                }
              />
            ))}
        </RuleSetAttributesContainer>
      )}
      <Modal.Root
        opened={isModalOpen}
        onClose={
          // istanbul ignore next
          () => setIsModalOpen(false)
        }
        centered
        size={`${2 * MODAL_WIDTH}px`}
        padding={0}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <AddSetAttribute
              category={category}
              searchTerms={searchTerms}
              onCancel={() => {
                setIsModalOpen(false);
              }}
              onSelect={(attribute: RulesetAttribute) => {
                if (
                  attribute.type === 'numeric' &&
                  (attribute.operation === 'boost' ||
                    attribute.operation === 'bury')
                ) {
                  const data = attribute.attribute as NumericBoostBury;
                  dispatch({
                    type: 'numericAttribute',
                    payload: {
                      change: 'add',
                      index: 0,
                      data,
                      operation: attribute.operation,
                    },
                  });
                }

                if (
                  attribute.type === 'alphanumeric' &&
                  (attribute.operation === 'boost' ||
                    attribute.operation === 'bury')
                ) {
                  const data = attribute.attribute as AlphanumericBoostBury;
                  dispatch({
                    type: 'alphanumericBoostBuryAttribute',
                    payload: {
                      change: 'add',
                      index: 0,
                      data,
                      operation: attribute.operation,
                    },
                  });
                }

                if (
                  attribute.type === 'alphanumeric' &&
                  (attribute.operation === 'include' ||
                    attribute.operation === 'exclude')
                ) {
                  const data = attribute.attribute as IncludeExclude;
                  dispatch({
                    type: 'alphanumericIncludeExcludeAttribute',
                    payload: {
                      change: 'add',
                      index: 0,
                      data: {
                        fields: data.fields,
                      },
                      operation: attribute.operation,
                    },
                  });
                }
                setIsModalOpen(false);
              }}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </Wrapper>
  );
};
