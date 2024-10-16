import styled from '@emotion/styled';
import { useContext, useState } from 'react';

import { KeywordRedirect, ReturnedKeywordRedirect } from '@/libs/api';
import {
  ProductGridHeader,
  RadioButtons,
  SearchKeywords,
  spacing,
  SubHeader3,
  Text,
} from '@/libs/components';
import { DateTimePickerModal } from '@/libs/components/calendar/date-time-picker-modal';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
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

const Input = styled.input`
  background-color: ${color.backgroundGrey};
  border: none;
  border-bottom: 1px solid ${color.grey};
  min-height: 64px;
  max-width: 1024px;
  width: 100%;
`;

const Duration = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${spacing(2)};
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

type Props = {
  onCreate?: (args: KeywordRedirect) => void;
  onSave?: (args: KeywordRedirect) => void;
  onCancel: () => void;
  redirect?: ReturnedKeywordRedirect;
  title: string;
};

export const Redirect = ({
  onCancel,
  onCreate,
  onSave,
  redirect: savedRedirect,
  title,
}: Props) => {
  const [redirect, setRedirect] = useState<KeywordRedirect>(
    savedRedirect
      ? {
          destinationUrl: savedRedirect.destinationUrl,
          isEnabled: savedRedirect.isEnabled,
          keywords: savedRedirect.keywords,
          type: savedRedirect.type,
          ruleTitle: savedRedirect.ruleTitle,
          startDate: savedRedirect.startDate,
          endDate: savedRedirect.endDate,
        }
      : {
          destinationUrl: '',
          isEnabled: true,
          keywords: [],
          ruleTitle: '',
          type: 'redirectTerm',
          startDate: '',
          endDate: '',
        }
  );

  const featureFlags = useContext(FeatureFlagContext);

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

  const getExistingDateRange = (
    startDate: string | undefined,
    endDate: string | undefined
  ) => {
    return startDate && endDate
      ? ([new Date(startDate), new Date(endDate)] as [Date, Date])
      : undefined;
  };

  return (
    <>
      <ProductGridHeader
        canSave={!!redirect.destinationUrl && redirect.keywords.length > 0}
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
          <SubHeader3>Redirect type</SubHeader3>

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
        <SubHeader3>
          {redirect.type === 'redirectTerm'
            ? 'Redirect Term(s)'
            : 'Redirect Phrase(s)'}
        </SubHeader3>
        <Row style={{ display: 'flex' }}>
          <SearchKeywords
            searchTerms={redirect.keywords}
            title={
              redirect.type === 'redirectTerm' ? 'Keyword*' : 'Keyword Phrase*'
            }
            addSearchTerm={onAddKeyword}
            removeSearchTerm={onRemoveKeyword}
          />
          {featureFlags.hasScheduling && (
            <Duration>
              <LabelContainer>Duration</LabelContainer>
              <DateTimePickerModal
                showCalendarIcon={true}
                dateTime={getExistingDateRange(
                  redirect.startDate,
                  redirect.endDate
                )}
                onUpdateDateTimeRange={([startDate, endDate]) => {
                  setRedirect({
                    ...redirect,
                    startDate: startDate ? startDate.toISOString() : '',
                    endDate: endDate ? endDate.toISOString() : '',
                  });
                }}
              />
            </Duration>
          )}
        </Row>
        <Row>
          <Text>Destination URL*</Text>
          <Input
            placeholder="c/"
            value={redirect.destinationUrl}
            onChange={(e) => onUpdate('destinationUrl', e.target.value)}
          />
        </Row>
        <Row>
          <Text>Rule Title</Text>
          <Input
            placeholder="Enter redirect title"
            value={redirect.ruleTitle}
            onChange={(e) => onUpdate('ruleTitle', e.target.value)}
          />
        </Row>
      </RedirectContent>
    </>
  );
};
