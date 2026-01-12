import styled from '@emotion/styled';
import { useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
} from '@/libs/api';
import {
  CombinedDropdown,
  RadioButtons,
  SubHeader2,
  Text,
  Typography,
} from '@/libs/components';
import { DateTimePickerModal } from '@/libs/containers/shared/calendar/date-time-picker-modal';
import { ProductGridHeader } from '@/libs/containers/shared/product-grid-header/product-grid-header';
import { SearchKeywords } from '@/libs/features/shared/search-keywords/search-keywords';
import { track } from '@/libs/hooks/utils/analytics';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

const RedirectType = styled.div`
  border-top: solid 1px ${color.accent.primary.primary};
  border-bottom: solid 1px ${color.accent.primary.primary};
  span {
    font-size: 16px;
  }
`;
const RedirectContent = styled.div`
  padding: ${spacing(2)};
`;

const Row = styled.div`
  margin-top: ${spacing(4)};
`;

const FullInputRow = styled.div`
  margin-top: ${spacing(4)};
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.label`
  font-size: 14px;
  margin-bottom: ${spacing(1)};
`;

const Input = styled.input`
  background-color: ${color.accent.secondary.secondaryContainer};
  border: none;
  border-bottom: 1px solid ${color.role.outline.outline};
  min-height: 64px;
  max-width: 1038px;
  width: 100%;
`;

const Duration = styled.div`
  display: flex;
  flex-direction: column;

  label {
    margin-top: ${spacing(0.5)};
  }
`;

type Props = {
  onCreate?: (args: MerchandisingKeywordRedirect) => void;
  onSave?: (args: MerchandisingKeywordRedirect) => void;
  onCancel: () => void;
  redirect?: MerchandisingReturnedKeywordRedirect;
  title: string;
  writeEnabled: boolean;
};

export const Redirect = ({
  onCancel,
  onCreate,
  onSave,
  redirect: savedRedirect,
  title,
  writeEnabled,
}: Props) => {
  const [redirect, setRedirect] = useState<MerchandisingKeywordRedirect>(
    savedRedirect
      ? {
          destinationUrl: savedRedirect.destinationUrl,
          isEnabled: savedRedirect.isEnabled,
          keywords: savedRedirect.keywords,
          type: savedRedirect.type,
          ruleTitle: savedRedirect.ruleTitle,
          startDate: savedRedirect.startDate,
          endDate: savedRedirect.endDate,
          countryCode: savedRedirect.countryCode,
        }
      : {
          destinationUrl: '',
          isEnabled: true,
          keywords: [],
          ruleTitle: '',
          type: 'redirectTerm',
          startDate: '',
          endDate: '',
          countryCode: 'UK_IE',
        }
  );

  const [defaultValue, setDefaultValue] = useState(savedRedirect?.keywords[0]);

  const onSaveRedirect = () => {
    if (onCreate) {
      onCreate(redirect);
    }
    if (onSave) {
      onSave(redirect);
    }
  };

  const onUpdate = (field: string, value: string) => {
    setRedirect({
      ...redirect,
      [field]: value,
    });
  };

  const onAddKeyword = (keyword: string) => {
    const keywords = [...redirect.keywords, keyword];
    setRedirect({
      ...redirect,
      keywords,
    });
  };

  // istanbul ignore next
  const onRemoveKeyword = (keyword: string) => {
    const keywords = redirect.keywords.filter((term) => term !== keyword);
    setRedirect({
      ...redirect,
      keywords,
    });
  };

  return (
    <>
      <ProductGridHeader
        canSave={
          writeEnabled &&
          !!redirect.destinationUrl &&
          redirect.keywords.length > 0
        }
        title={title}
        onCancel={onCancel}
        onSave={onSaveRedirect}
        hasPreview={false}
        shouldHidePreview
        isNewRuleSet={!!onCreate}
        hasChanges={false}
        rulesetType="redirect"
        writeEnabled={writeEnabled}
      />
      <RedirectType>
        <RedirectContent>
          <SubHeader2>Redirect type</SubHeader2>

          <RadioButtons
            hasDivider={false}
            isBold={false}
            values={[
              {
                name: 'Redirect Term(s)',
                isSelected: redirect.type === 'redirectTerm',
              },
              {
                name: 'Redirect Phrase(s)',
                isSelected: redirect.type === 'redirectPhrase',
              },
            ]}
            onSelect={(name) => {
              // istanbul ignore next
              setRedirect({
                ...redirect,
                type:
                  name === 'Redirect Term(s)'
                    ? 'redirectTerm'
                    : 'redirectPhrase',
              });
            }}
          />
        </RedirectContent>
      </RedirectType>

      <RedirectContent>
        <SubHeader2>
          {redirect.type === 'redirectTerm'
            ? 'Redirect Term(s)'
            : 'Redirect Phrase(s)'}
        </SubHeader2>
        <Row style={{ display: 'flex', flexWrap: 'wrap', gap: spacing(2) }}>
          <div>
            <Typography as="p" withMargin variant="labelMedium">
              Influence
            </Typography>
            <CombinedDropdown
              variant="countrySelector"
              onChange={(country) => {
                onUpdate('countryCode', country as MerchandisingCountryCode);
                track({ event: `Change redirect influence to ${country}` });
              }}
              ariaLabel="Select country"
              selectedCountryCode={redirect.countryCode}
            />
          </div>
          <SearchKeywords
            searchTerms={redirect.keywords}
            title={
              redirect.type === 'redirectTerm' ? 'Keyword*' : 'Keyword Phrase*'
            }
            addSearchTerm={onAddKeyword}
            removeSearchTerm={onRemoveKeyword}
            previewSearchTerm={defaultValue}
            selectPreviewSearchTerm={(term: string | undefined) => {
              setDefaultValue(term);
            }}
            writeEnabled={writeEnabled}
          />
          <Duration>
            <Typography as="p" withMargin variant="labelMedium">
              Duration
            </Typography>
            <DateTimePickerModal
              showCalendarIcon
              dateTime={[
                redirect.startDate ? new Date(redirect.startDate) : null,
                redirect.endDate ? new Date(redirect.endDate) : null,
              ]}
              onUpdateDateTimeRange={([startDate, endDate]) => {
                setRedirect({
                  ...redirect,
                  startDate: startDate ? startDate.toISOString() : '',
                  endDate: endDate ? endDate.toISOString() : '',
                });
              }}
              writeEnabled={writeEnabled}
            />
          </Duration>
        </Row>
        <FullInputRow>
          <StyledLabel htmlFor="destination-url-input">
            Destination URL*
          </StyledLabel>
          <Input
            id="destination-url-input"
            placeholder="c/"
            value={redirect.destinationUrl}
            {...(writeEnabled && {
              onChange: (e) => onUpdate('destinationUrl', e.target.value),
            })}
            readOnly={!writeEnabled}
          />
        </FullInputRow>
        <FullInputRow>
          <StyledLabel htmlFor="rule-title-input">
            <Text>Rule Title</Text>
          </StyledLabel>
          <Input
            id="rule-title-input"
            placeholder="Enter redirect title"
            value={redirect.ruleTitle}
            {...(writeEnabled && {
              onChange: (e) => onUpdate('ruleTitle', e.target.value),
            })}
            readOnly={!writeEnabled}
          />
        </FullInputRow>
      </RedirectContent>
    </>
  );
};
