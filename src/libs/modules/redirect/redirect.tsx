import styled from '@emotion/styled';
import { useState } from 'react';

import type {
  MerchandisingCountryCode,
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
} from '@/libs/api';
import {
  ErrorMessage,
  ProductGridHeader,
  RadioButtons,
  SearchKeywords,
  spacing,
  SubHeader2,
  Text,
} from '@/libs/components';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { CountrySelectorDropdown } from '@/libs/components/dropdowns/country-selector/country-selector';
import { checkForDuplicates } from '@/libs/components/utils/check-for-duplicates';
import { color } from '@/libs/components/utils/constants';

const RedirectType = styled.div`
  border-top: solid 1px ${color.darkHeritageGreen};
  border-bottom: solid 1px ${color.darkHeritageGreen};
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
  background-color: ${color.backgroundGrey};
  border: none;
  border-bottom: 1px solid ${color.grey};
  min-height: 64px;
  max-width: 1038px;
  width: 100%;
`;

const Duration = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};

  label {
    margin-top: ${spacing(0.5)};
  }
`;

const LabelContainer = styled.label`
  display: flex;
  font-size: 14px;
  align-items: center;
`;

const InfluenceLabel = styled(Text)`
  margin-bottom: ${spacing(1)};
  line-height: 1.6rem;
`;

type Props = {
  onCreate?: (args: MerchandisingKeywordRedirect) => void;
  onSave?: (args: MerchandisingKeywordRedirect) => void;
  onCancel: () => void;
  redirect?: MerchandisingReturnedKeywordRedirect;
  title: string;
  writeEnabled?: boolean;
};

export const Redirect = ({
  onCancel,
  onCreate,
  onSave,
  redirect: savedRedirect,
  title,
  writeEnabled = true,
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
  const [duplicationError, setDuplicationError] = useState('');

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
    const hasDuplicates = checkForDuplicates(
      [...redirect.keywords],
      keyword,
      'keyword'
    );
    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      setRedirect({
        ...redirect,
        keywords,
      });
      setDuplicationError('');
    }
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
        shouldHidePreview={true}
        isNewRuleSet={!!onCreate}
        hasChanges={false}
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
            <InfluenceLabel>Influence</InfluenceLabel>
            <CountrySelectorDropdown
              onChange={(country: MerchandisingCountryCode) =>
                onUpdate('countryCode', country)
              }
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
            error={duplicationError}
          />
          <Duration>
            <LabelContainer>Duration</LabelContainer>
            <DateTimePickerModal
              showCalendarIcon={true}
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
            />
          </Duration>
        </Row>
        {duplicationError && (
          <ErrorMessage style={{ padding: 0 }}>{duplicationError}</ErrorMessage>
        )}
        <FullInputRow>
          <StyledLabel htmlFor="destination-url-input">
            Destination URL*
          </StyledLabel>
          <Input
            id="destination-url-input"
            placeholder="c/"
            value={redirect.destinationUrl}
            onChange={(e) => onUpdate('destinationUrl', e.target.value)}
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
            onChange={(e) => onUpdate('ruleTitle', e.target.value)}
          />
        </FullInputRow>
      </RedirectContent>
    </>
  );
};
