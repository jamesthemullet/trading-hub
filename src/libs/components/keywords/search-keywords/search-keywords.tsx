import styled from '@emotion/styled';
import { FormEvent, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import Image from 'next/image';

import { Button } from '../../buttons/button/button';
import { SearchBox } from '../../search-box/search-box';
import { ErrorMessage, Label } from '../../typography/typography.styles';
import { color } from '../../utils/constants';
import { spacing } from '../../utils/spacing';
import {
  ErrorContainer,
  ErrorText,
  Heading,
  KeywordList,
  KeyWordPill,
  ModalContainer,
  ModalFooter,
  ModalSelectedKeyword,
  RemoveKeyWordPill,
  SelectKeywordPill,
  StyledCloseButton,
  StyledInput,
  StyledSearchContainer,
} from './modal.styles';

const MAX_CHARS = 50;

const SearchKeywordsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing(1)};
`;

const LabelContainer = styled.div`
  display: flex;
  font-size: 14px;
  align-items: baseline;
`;

const SearchBoxContainer = styled.div`
  display: flex;
  gap: ${spacing(1)};
  align-items: center;
`;

const Count = styled.span`
  background: ${color.darkHeritageGreen};
  color: #fff;
  margin-left: ${spacing(1)};
  border-radius: 13px;
  padding: 1px 6px;
  font-weight: 600;
  min-width: 26px;
  height: 26px;
  display: inline;
  text-align: center;
  font-size: 16px;
`;

const ViewAllButton = styled(Button)`
  width: 100px;
  margin-left: ${spacing(1)};
`;

const InputBoxWrapper = styled.div`
  background-color: #f5f5f5;
  border-bottom: solid 1px #cacaca;
  height: 55px;
  width: 470px;
  display: flex;
  align-items: center;
  padding: 0 ${spacing(1)};

  & > * {
    flex-shrink: 0;
  }
`;

const StyledForm = styled.form`
  flex-grow: 1;
  width: 0;
  min-width: 0;
  overflow: hidden;
`;

const KeyWordInput = styled.input`
  flex: 1 1 auto;
  display: inline-block;
  background: none;
  border: none;
  height: 40px;
  width: 100%;
  text-overflow: ellipsis;

  &:focus {
    outline: none;
  }
`;

export type Props = {
  addSearchTerm: (keyword: string) => void;
  removeSearchTerm: (keyword: string) => void;
  searchTerms: string[];
  title: string;
  previewSearchTerm?: string | undefined;
  selectPreviewSearchTerm?: (keyword: string | undefined) => void;
  error?: string;
};

const calculateWordsToDisplay = (searchTerms: string[], MAX_CHARS: number) => {
  const result = searchTerms
    .map((term, index) => ({ term, index }))
    .find(({ term }, i, arr) => {
      const charCount = arr
        .slice(0, i)
        .reduce((acc, { term }) => acc + term.length + 10, 0);
      return charCount + term.length + 2 > MAX_CHARS;
    });

  const wordsToDisplay = result ? result.index : searchTerms.length;

  return {
    wordsToDisplay,
    charCount: wordsToDisplay * 2,
    showViewAllButton: searchTerms.length > wordsToDisplay,
  };
};

export const SearchKeywords = ({
  addSearchTerm,
  previewSearchTerm,
  removeSearchTerm,
  searchTerms,
  selectPreviewSearchTerm,
  title,
  error,
}: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [inputText, setInputText] = useState('');

  const [inputValue, setInputValue] = useState('');

  const [filterValue, setFilterValue] = useState('');
  const [filteredKeywords, setFilteredKeywords] =
    useState<string[]>(searchTerms);
  const [unfinishedKeyword, setUnfinishedKeyword] = useState<boolean>(false);

  const openModal = () => {
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
  };

  const onAddKeyword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addSearchTerm(inputText);
    setInputText('');
  };

  const { wordsToDisplay, showViewAllButton } = calculateWordsToDisplay(
    searchTerms,
    MAX_CHARS
  );

  useEffect(() => {
    setFilteredKeywords(
      searchTerms
        .filter((term) => term !== previewSearchTerm)
        .filter((keyword) =>
          keyword.toLowerCase().includes(filterValue.toLowerCase())
        )
    );
  }, [filterValue, searchTerms, previewSearchTerm]);

  const handleClose = () => {
    if (inputValue === '') {
      onClose();
    } else {
      setUnfinishedKeyword(true);
    }
  };

  const additionalSearchTerms = searchTerms.filter(
    (term) => term !== previewSearchTerm
  );

  const sortedSearchTerms = [...searchTerms].sort((a, b) =>
    a === previewSearchTerm ? -1 : b === previewSearchTerm ? 1 : 0
  );

  return (
    <>
      <SearchKeywordsContainer>
        <LabelContainer>
          <label htmlFor="searchId">{title}</label>
          <Count aria-label="number of keywords">{searchTerms.length}</Count>
        </LabelContainer>
        <SearchBoxContainer>
          <InputBoxWrapper>
            {sortedSearchTerms.map((term, index) => {
              const isSelectedSearchTerm =
                previewSearchTerm === term && !!selectPreviewSearchTerm;
              return index < wordsToDisplay ? (
                <KeyWordPill
                  key={`${term}-${index}`}
                  isSelected={isSelectedSearchTerm}
                  as="p"
                >
                  {isSelectedSearchTerm || !selectPreviewSearchTerm ? (
                    term
                  ) : (
                    <SelectKeywordPill
                      onClick={() => selectPreviewSearchTerm(term)}
                    >
                      {term}
                    </SelectKeywordPill>
                  )}
                  <RemoveKeyWordPill
                    onClick={() => {
                      removeSearchTerm(term);

                      if (isSelectedSearchTerm) {
                        selectPreviewSearchTerm(
                          additionalSearchTerms.length
                            ? additionalSearchTerms[0]
                            : undefined
                        );
                      }
                    }}
                    aria-label={`Remove keyword: ${term}`}
                  >
                    <Image
                      alt=""
                      src={`/trading-hub/asset/icon-remove-${isSelectedSearchTerm ? 'selected-' : ''}chip.svg`}
                      width={16}
                      height={16}
                    />
                  </RemoveKeyWordPill>
                </KeyWordPill>
              ) : null;
            })}
            <StyledForm onSubmit={onAddKeyword} style={{ display: 'inline' }}>
              <KeyWordInput
                aria-label="Add keyword"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onBlur={() => {
                  if (inputText) {
                    addSearchTerm(inputText);
                    setInputText('');
                  }
                }}
              />
            </StyledForm>
          </InputBoxWrapper>
          {showViewAllButton && (
            <ViewAllButton
              onClick={() => openModal()}
              theme="secondary"
              aria-label="View all"
            >
              View all
            </ViewAllButton>
          )}
        </SearchBoxContainer>
      </SearchKeywordsContainer>

      <Modal.Root
        opened={showModal}
        onClose={onClose}
        centered
        padding={20}
        size="auto"
        closeOnClickOutside={false}
        closeOnEscape={false}
        aria-label="Search Keywords Modal"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <ModalContainer>
              <Heading>{title}</Heading>
              <StyledSearchContainer>
                <SearchBox
                  inputProps={{
                    id: 'searchId',
                    label: 'search keywords',
                    isLabelHidden: true,
                    placeholder: 'Search...',
                    value: filterValue,
                    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                      setFilterValue(event.target.value);
                    },
                  }}
                  iconButtonProps={{
                    id: 'SearchIconInputBtn',
                  }}
                />
              </StyledSearchContainer>
              {previewSearchTerm && (
                <ModalSelectedKeyword aria-label="Preview category">
                  <Label as="h4">Selected: </Label>
                  <KeyWordPill isSelected as="p">
                    {previewSearchTerm}
                    <RemoveKeyWordPill
                      onClick={
                        // istanbul ignore next
                        () => {
                          removeSearchTerm(previewSearchTerm);
                          if (selectPreviewSearchTerm) {
                            selectPreviewSearchTerm(
                              additionalSearchTerms.length
                                ? additionalSearchTerms[0]
                                : undefined
                            );
                          }
                        }
                      }
                      aria-label={`Remove category from modal: ${previewSearchTerm}`}
                    >
                      <Image
                        alt=""
                        src={`/trading-hub/asset/icon-remove-selected-chip.svg`}
                        width={16}
                        height={16}
                      />
                    </RemoveKeyWordPill>
                  </KeyWordPill>
                </ModalSelectedKeyword>
              )}
              <KeywordList unfinishedKeyword={unfinishedKeyword}>
                {filteredKeywords.map((keyword, index) => (
                  <KeyWordPill key={`${keyword}-${index}`} isSelected={false}>
                    {selectPreviewSearchTerm ? (
                      <SelectKeywordPill
                        onClick={() => selectPreviewSearchTerm(keyword)}
                      >
                        {keyword}
                      </SelectKeywordPill>
                    ) : (
                      keyword
                    )}
                    <RemoveKeyWordPill
                      onClick={() => removeSearchTerm(keyword)}
                      aria-label={`Remove keyword: ${keyword}`}
                    >
                      <Image
                        alt=""
                        src={`/trading-hub/asset/icon-remove-chip.svg`}
                        width={16}
                        height={16}
                      />
                    </RemoveKeyWordPill>
                  </KeyWordPill>
                ))}
                <StyledInput
                  type="text"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    setUnfinishedKeyword(false);
                    if (event.key === 'Enter') {
                      addSearchTerm(inputValue);
                      setInputValue('');
                    }
                  }}
                  aria-label="Add keyword to list"
                  style={{
                    flex: '1',
                    border: 'none',
                    outline: 'none',
                  }}
                />
              </KeywordList>
              {error && (
                <ErrorMessage style={{ padding: 0 }}>{error}</ErrorMessage>
              )}
            </ModalContainer>
          </Modal.Body>
          <ModalFooter>
            {unfinishedKeyword && (
              <ErrorContainer>
                <Image
                  alt=""
                  src={`/trading-hub/asset/icon-warning.svg`}
                  width={20}
                  height={20}
                />
                <ErrorText>Please finish adding the keyword to close</ErrorText>
              </ErrorContainer>
            )}
            <StyledCloseButton
              theme="secondary"
              onClick={handleClose}
              aria-label="Close keywords modal"
            >
              Close
            </StyledCloseButton>
          </ModalFooter>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
