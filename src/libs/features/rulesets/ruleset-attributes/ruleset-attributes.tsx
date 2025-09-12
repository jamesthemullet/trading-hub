import styled from '@emotion/styled';
import type { Dispatch } from 'react';
import { useState } from 'react';

import type {
  MerchandisingAlphanumericBoostBury,
  MerchandisingCountryCode,
  MerchandisingIncludeExclude,
  MerchandisingNumericBoostBury,
  MerchandisingRules,
} from '@/libs/api';
import { Button, Typography } from '@/libs/components';
import { AlphanumericAttribute } from '@/libs/components/ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '@/libs/components/ruleset-attributes/numeric-attribute';
import { AttributeCount } from '@/libs/components/ruleset-attributes/ruleset-attributes.styles';
import type { AttributeEdit, RuleSetActions } from '@/libs/components/types';
import { spacing } from '@/libs/components/utils/spacing';

import pluralize from 'pluralize';

import { RulesetAttributesModal } from './ruleset-attributes-modal';

const Wrapper = styled.div`
  position: relative;
`;

const RuleSetAttributesContainer = styled.div`
  height: calc(100vh - 375px);
  overflow-y: auto;
`;

const ButtonContainer = styled.div<{
  rulesetType: 'global' | 'category' | 'search';
}>`
  margin: ${(props) =>
    props.rulesetType === 'global' ? `${spacing(1)} 0` : '0'};
  display: ${(props) => props.rulesetType === 'global' && 'flex'};
  justify-content: space-between;
  align-items: baseline;
  flex-direction: ${(props) => props.rulesetType !== 'global' && 'column'};

  button {
    max-width: ${(props) => props.rulesetType === 'global' && '312px'};
  }

  p {
    margin-bottom: ${(props) => props.rulesetType === 'global' && '0'};
  }
`;

export type RulesetAttributesProps = {
  countryCode: MerchandisingCountryCode;
  categories?: string[];
  searchTerms?: string[];
  merchandisingRules: MerchandisingRules;
  dispatch: Dispatch<RuleSetActions>;
  writeEnabled: boolean;
  rulesetType: 'global' | 'category' | 'search';
};

export const RulesetAttributes = ({
  countryCode,
  categories,
  merchandisingRules,
  dispatch,
  searchTerms,
  writeEnabled,
  rulesetType,
}: RulesetAttributesProps) => {
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
      {writeEnabled && (
        <ButtonContainer rulesetType={rulesetType}>
          <Button
            theme="outlined"
            icon="plus-simple-green"
            isTextCentred
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            Create new attribute rule
          </Button>
          {countOfAttributeChanges > 0 && (
            <AttributeCount as="output">
              {countOfAttributeChanges} attribute{' '}
              {pluralize('rule', countOfAttributeChanges)}
            </AttributeCount>
          )}
        </ButtonContainer>
      )}
      {countOfAttributeChanges > 0 && (
        <RuleSetAttributesContainer data-testid="Ruleset attributes">
          {(!!alphanumericBoost.length || !!alphanumericBuries.length) && (
            <Typography variant="bodyMedium" isStrong withMargin as="h3">
              Product Description Attribute Rules
            </Typography>
          )}

          {!!alphanumericBoost.length &&
            alphanumericBoost.map(({ fields, weight }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable={writeEnabled}
                canEditWeight
                fields={fields}
                operation="boost"
                weight={weight}
                onDelete={({
                  fields,
                  weight,
                }: MerchandisingAlphanumericBoostBury) =>
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
                isEditable={writeEnabled}
                canEditWeight
                fields={fields}
                operation="bury"
                weight={weight}
                onDelete={({
                  fields,
                  weight,
                }: MerchandisingAlphanumericBoostBury) =>
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
                isEditable={writeEnabled}
                fields={fields}
                operation="include"
                onDelete={({ fields }: MerchandisingIncludeExclude) =>
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
                isEditable={writeEnabled}
                fields={fields}
                operation="exclude"
                onDelete={({ fields }: MerchandisingIncludeExclude) =>
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
            <Typography variant="bodyMedium" isStrong withMargin as="h3">
              Numeric Attribute Rules
            </Typography>
          )}
          {!!numericBoosts.length &&
            numericBoosts.map(({ field, weight }, index) => (
              <NumericAttribute
                key={field}
                isEditable={writeEnabled}
                operation="boost"
                name={field}
                weight={weight}
                onDelete={({ field, weight }: MerchandisingNumericBoostBury) =>
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
                isEditable={writeEnabled}
                operation="bury"
                name={field}
                weight={weight}
                onDelete={({ field, weight }: MerchandisingNumericBoostBury) =>
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
