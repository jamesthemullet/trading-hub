import styled from '@emotion/styled';
import { FormEvent, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import Image from 'next/image';

import { Button } from '../../buttons/button/button';
import { SearchBox } from '../../search-box/search-box';
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
  align-items: center;
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
`;

const InputBoxWrapper = styled.div`
  background-color: #f5f5f5;
  border-bottom: solid 1px #cacaca;
  height: 56px;
  width: 470px;
  display: flex;
  gap: ${spacing(1)};
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

type Props = {
  searchTerms: string[];
  title: string;
  addSearchTerm: (keyword: string) => void;
  removeSearchTerm: (keyword: string) => void;
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
  searchTerms,
  title,
  addSearchTerm,
  removeSearchTerm,
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
      searchTerms.filter((keyword) =>
        keyword.toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }, [filterValue, searchTerms]);

  const handleClose = () => {
    if (inputValue === '') {
      onClose();
    } else {
      setUnfinishedKeyword(true);
    }
  };

  return (
    <>
      <SearchKeywordsContainer>
        <LabelContainer>
          <label htmlFor="searchId">{title}</label>
          <Count aria-label="number of keywords">{searchTerms.length}</Count>
        </LabelContainer>
        <SearchBoxContainer>
          <InputBoxWrapper>
            {searchTerms.map((term, index) => {
              return index < wordsToDisplay ? (
                <KeyWordPill key={`${term}-${index}`}>
                  {term}
                  <Button
                    onClick={() => removeSearchTerm(term)}
                    aria-label={`Remove keyword: ${term}`}
                  >
                    <Image
                      alt=""
                      src={`/trading-hub/asset/icon-remove-keyword.svg`}
                      width={16}
                      height={16}
                    />
                  </Button>
                </KeyWordPill>
              ) : null;
            })}
            <StyledForm onSubmit={onAddKeyword} style={{ display: 'inline' }}>
              <KeyWordInput
                aria-label="Add keyword"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
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
      {showModal && (
        <Modal.Root
          opened={true}
          onClose={onClose}
          centered
          padding={20}
          size="auto"
          closeOnClickOutside={false}
          closeOnEscape={false}
        >
          <Modal.Overlay blur={3} />
          <Modal.Content>
            <Modal.Body>
              <ModalContainer>
                <Heading>Search keywords</Heading>
                <StyledSearchContainer>
                  <SearchBox
                    inputProps={{
                      id: 'searchId',
                      label: 'search keywords',
                      isLabelHidden: true,
                      placeholder: 'Search...',
                      value: filterValue,
                      onChange: (
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFilterValue(event.target.value);
                      },
                    }}
                    iconButtonProps={{
                      id: 'SearchIconInputBtn',
                    }}
                  />
                </StyledSearchContainer>
                <KeywordList unfinishedKeyword={unfinishedKeyword}>
                  {filteredKeywords.map((keyword, index) => (
                    <KeyWordPill key={`${keyword}-${index}`}>
                      {keyword}
                      <Button
                        onClick={() => removeSearchTerm(keyword)}
                        aria-label={`Remove keyword: ${keyword}`}
                      >
                        <Image
                          alt=""
                          src={`/trading-hub/asset/icon-remove-keyword.svg`}
                          width={16}
                          height={16}
                        />
                      </Button>
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
                  <ErrorText>
                    Please finish adding the keyword to close
                  </ErrorText>
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
      )}
    </>
  );
};
