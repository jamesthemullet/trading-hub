import styled from '@emotion/styled';
import { useState } from 'react';

import { KeywordRedirect, ReturnedKeywordRedirect } from '@/libs/api';
import {
  ProductGridHeader,
  RadioButtons,
  SearchKeywords,
  spacing,
  SubHeader3,
  Text,
} from '@/libs/components';
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
        }
      : {
          destinationUrl: '',
          isEnabled: true,
          keywords: [],
          ruleTitle: '',
          type: 'redirectTerm',
        }
  );

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
        <Row>
          <SearchKeywords
            searchTerms={redirect.keywords}
            title={
              redirect.type === 'redirectTerm' ? 'Keyword*' : 'Keyword Phrase*'
            }
            addSearchTerm={onAddKeyword}
            removeSearchTerm={onRemoveKeyword}
          />
        </Row>
        <Row>
          <Text>Detination URL*</Text>
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
