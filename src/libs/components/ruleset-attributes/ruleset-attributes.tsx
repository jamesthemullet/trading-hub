import styled from '@emotion/styled';
import { useState } from 'react';
import { Modal } from '@mantine/core';

import {
  AlphanumericBoostBury,
  IncludeExclude,
  MerchandisingRules,
  NumericBoostBury,
} from '@/libs/api';

import pluralize from 'pluralize';

import { Button } from '../buttons/button/button';
import { RulesetAttribute } from '../types';
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
  onChangeAttribute: (args: RulesetAttribute) => void;
};

export const RulesetAttributes = ({
  category,
  merchandisingRules,
  onChangeAttribute,
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
                operation="boosts"
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    onChangeAttribute({
                      attribute: { fields, weight: newWeight },
                      change: 'modify',
                      index,
                      operation: 'boosts',
                      type: 'alphanumeric',
                    })
                }
                onDelete={({ fields, weight }: AlphanumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { fields, weight },
                    change: 'remove',
                    operation: 'boosts',
                    type: 'alphanumeric',
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
                operation="buries"
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    onChangeAttribute({
                      attribute: { fields, weight: newWeight },
                      change: 'modify',
                      index,
                      operation: 'buries',
                      type: 'alphanumeric',
                    })
                }
                onDelete={({ fields, weight }: AlphanumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { fields, weight },
                    change: 'remove',
                    operation: 'buries',
                    type: 'alphanumeric',
                  })
                }
              />
            ))}

          {!!alphanumericIncludes.length &&
            alphanumericIncludes.map(({ fields }) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="includes"
                onDelete={({ fields }: IncludeExclude) =>
                  onChangeAttribute({
                    attribute: { fields },
                    change: 'remove',
                    operation: 'includes',
                    type: 'alphanumeric',
                  })
                }
              />
            ))}

          {!!alphanumericExcludes.length &&
            alphanumericExcludes.map(({ fields }) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="excludes"
                onDelete={({ fields }: IncludeExclude) =>
                  onChangeAttribute({
                    attribute: { fields },
                    change: 'remove',
                    operation: 'excludes',
                    type: 'alphanumeric',
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
                operation="boosts"
                name={field}
                weight={weight}
                onChangeAttribute={({ newWeight }: { newWeight: number }) =>
                  onChangeAttribute({
                    attribute: { field, weight: newWeight },
                    change: 'modify',
                    index,
                    operation: 'boosts',
                    type: 'numeric',
                  })
                }
                onDelete={({ field, weight }: NumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { field, weight },
                    change: 'remove',
                    operation: 'boosts',
                    type: 'numeric',
                  })
                }
              />
            ))}
          {!!numericBury.length &&
            numericBury.map(({ field, weight }, index) => (
              <NumericAttribute
                key={field}
                isEditable
                operation="buries"
                name={field}
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    onChangeAttribute({
                      attribute: { field, weight: newWeight },
                      change: 'modify',
                      index,
                      operation: 'buries',
                      type: 'numeric',
                    })
                }
                onDelete={({ field, weight }: NumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { field, weight },
                    change: 'remove',
                    operation: 'buries',
                    type: 'numeric',
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
                onChangeAttribute(attribute);
                setIsModalOpen(false);
              }}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </Wrapper>
  );
};
