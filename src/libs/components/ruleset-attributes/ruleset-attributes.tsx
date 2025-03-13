import styled from '@emotion/styled';
import type { Dispatch } from 'react';
import { useState } from 'react';

import type {
  AlphanumericBoostBury,
  CountryCode,
  IncludeExclude,
  MerchandisingRules,
  NumericBoostBury,
} from '@/libs/api';

import pluralize from 'pluralize';

import { Button } from '../buttons/button/button';
import type { Action, AttributeEdit } from '../types';
import { Label } from '../typography/typography.styles';
import { spacing } from '../utils/spacing';
import { AlphanumericAttribute } from './alphanumeric-attribute';
import { NumericAttribute } from './numeric-attribute';
import { AttributeCount } from './ruleset-attributes.styles';
import { RulesetAttributesModal } from './ruleset-attributes-modal';

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
  countryCode: CountryCode;
  categories?: string[];
  searchTerms?: string[];
  merchandisingRules: MerchandisingRules;
  dispatch: Dispatch<Action>;
};

export const RulesetAttributes = ({
  countryCode,
  categories,
  merchandisingRules,
  dispatch,
  searchTerms,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editData, setEditData] = useState<AttributeEdit | null>(null);
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

  const handleAttributeEdit = (data: AttributeEdit) => {
    setEditData(data);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  return (
    <Wrapper>
      <CreateNew onClick={() => setIsModalOpen(!isModalOpen)}>
        <Icon alt="" src="/trading-hub/asset/icon-plus-simple.svg" />
        Create new attribute rule
      </CreateNew>
      {countOfAttributeChanges > 0 && (
        <RuleSetAttributesContainer data-testid="Ruleset attributes">
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
                canEditWeight
                fields={fields}
                operation="boost"
                weight={weight}
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
                onEdit={(args) =>
                  handleAttributeEdit({
                    ...args,
                    weight,
                    index,
                    operation: 'boost',
                    type: 'alphanumericBoostBury',
                  })
                }
              />
            ))}

          {!!alphanumericBuries.length &&
            alphanumericBuries.map(({ fields, weight }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                canEditWeight
                fields={fields}
                operation="bury"
                weight={weight}
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
                onEdit={(args) =>
                  handleAttributeEdit({
                    ...args,
                    weight,
                    index,
                    operation: 'bury',
                    type: 'alphanumericBoostBury',
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
                onEdit={(args) =>
                  handleAttributeEdit({
                    ...args,
                    index,
                    operation: 'include',
                    type: 'alphanumericIncludeExclude',
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
                onEdit={(args) =>
                  handleAttributeEdit({
                    ...args,
                    index,
                    operation: 'exclude',
                    type: 'alphanumericIncludeExclude',
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
                onEdit={(args) =>
                  handleAttributeEdit({
                    ...args,
                    weight,
                    index,
                    operation: 'boost',
                    type: 'numericBoostBury',
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
                onEdit={(args) =>
                  handleAttributeEdit({
                    ...args,
                    weight,
                    index,
                    operation: 'bury',
                    type: 'numericBoostBury',
                  })
                }
              />
            ))}
        </RuleSetAttributesContainer>
      )}

      <RulesetAttributesModal
        isModalOpen={isModalOpen}
        onCloseModal={handleCloseModal}
        dispatch={dispatch}
        countryCode={countryCode}
        categories={categories}
        searchTerms={searchTerms}
        editData={editData}
      />
    </Wrapper>
  );
};
