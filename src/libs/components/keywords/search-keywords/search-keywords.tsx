import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import { useOnOutsideClick } from '@/libs/hooks';

import Image from 'next/image';

import { Button } from '../../buttons/button/button';
import { Count } from '../../count/count';
import {
  Arrow,
  ArrowContainer,
  DropdownButton,
  DropdownContainer,
  DropdownHeading,
  DropdownOption,
  DropdownWrapperNoBorder,
} from '../../dropdown/dropdown.styles';
import { SearchBox } from '../../search-box/search-box';
import {
  ErrorMessage,
  Text,
  Typography,
} from '../../typography/typography.styles';
import { checkForDuplicates } from '../../utils/check-for-duplicates';
import { spacing } from '../../utils/spacing';
import {
  ErrorContainer,
  ErrorText,
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

const DEFAULT_DROPDOWN_WIDTH = 256;
const ACTIVE_DROPDOWN_WIDTH = 320;

const SearchBoxContainer = styled.div`
  display: flex;
  gap: ${spacing(1)};
  align-items: center;
`;

const DropdownText = styled(Text)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ModalWrapper = styled.div`
  padding-top: ${spacing(2)};
`;

export type Props = {
  addSearchTerm: (keyword: string) => void;
  removeSearchTerm: (keyword: string) => void;
  searchTerms: string[];
  title: string;
  writeEnabled: boolean;
  previewSearchTerm: string | undefined;
  selectPreviewSearchTerm: (keyword: string | undefined) => void;
};

export const SearchKeywords = ({
  addSearchTerm,
  previewSearchTerm,
  removeSearchTerm,
  searchTerms,
  selectPreviewSearchTerm,
  title,
  writeEnabled,
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [duplicationError, setDuplicationError] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: () => setIsDropdownOpen(false),
  });

  const [filterValue, setFilterValue] = useState('');
  const [filteredKeywords, setFilteredKeywords] =
    useState<string[]>(searchTerms);
  const [unfinishedKeyword, setUnfinishedKeyword] = useState<boolean>(false);

  const onClose = () => {
    setShowModal(false);
    setDuplicationError('');
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // istanbul ignore else
    if (e.key === 'Escape' && isDropdownOpen) {
      e.preventDefault();
      setIsDropdownOpen(false);
    }
  };

  const onAddKeyword = () => {
    const hasDuplicates = checkForDuplicates(
      [...searchTerms],
      inputValue,
      'keyword'
    );

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      addSearchTerm(inputValue);
      setInputValue('');
      setDuplicationError('');

      if (!previewSearchTerm) {
        selectPreviewSearchTerm(inputValue);
      }
    }
  };

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
      <div>
        <Typography as="p" withMargin variant="labelMedium">
          {title}
          <Count aria-label="number of keywords">{searchTerms.length}</Count>
        </Typography>
        <SearchBoxContainer>
          <DropdownWrapperNoBorder
            isDropdownOpen={isDropdownOpen}
            width={
              previewSearchTerm ? DEFAULT_DROPDOWN_WIDTH : ACTIVE_DROPDOWN_WIDTH
            }
            ref={dropdownWrapperRef}
            onKeyDown={handleOnKeyDown}
          >
            <DropdownButton
              isDropdownOpen={isDropdownOpen}
              onClick={() =>
                sortedSearchTerms.length > 1
                  ? setIsDropdownOpen(!isDropdownOpen)
                  : setShowModal(true)
              }
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-label="select keyword"
              disabled={!previewSearchTerm}
            >
              <DropdownHeading>
                {previewSearchTerm ? (
                  <>{previewSearchTerm}</>
                ) : (
                  'Add categories to display here'
                )}
              </DropdownHeading>
              <ArrowContainer borderLeft={false}>
                <Arrow isDropdownOpen={isDropdownOpen} />
              </ArrowContainer>
            </DropdownButton>

            <DropdownContainer isDropdownOpen={isDropdownOpen}>
              {additionalSearchTerms.map((searchTerm) => (
                <DropdownOption
                  key={`search-term-${searchTerm}`}
                  hoverColour="#f5f5f5"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    selectPreviewSearchTerm(searchTerm);
                  }}
                  align="left"
                >
                  <DropdownText>{searchTerm}</DropdownText>
                </DropdownOption>
              ))}
            </DropdownContainer>
          </DropdownWrapperNoBorder>

          <Button
            theme="filled"
            isInline
            onClick={() => setShowModal(true)}
            isDisabled={!writeEnabled}
          >
            Edit
          </Button>
        </SearchBoxContainer>
      </div>

      <Modal.Root
        opened={showModal}
        onClose={onClose}
        centered
        padding={20}
        size="auto"
        closeOnClickOutside={false}
        closeOnEscape={false}
        role="dialog"
        aria-modal="true"
        aria-label="Search Keywords Modal"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <ModalContainer>
              <ModalWrapper>
                <Typography variant="titleSmall" isStrong withMargin>
                  {title}
                </Typography>
                {writeEnabled && (
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
                )}
                {previewSearchTerm && (
                  <ModalSelectedKeyword aria-label="Preview keyword">
                    <Typography as="h4" variant="bodyMedium">
                      Selected:
                    </Typography>
                    <KeyWordPill isSelected as="div">
                      <Typography variant="bodySmall" isStrong>
                        {previewSearchTerm}
                      </Typography>
                      {writeEnabled && (
                        <RemoveKeyWordPill
                          onClick={
                            // istanbul ignore next
                            () => {
                              removeSearchTerm(previewSearchTerm);

                              selectPreviewSearchTerm(
                                additionalSearchTerms.length
                                  ? additionalSearchTerms[0]
                                  : undefined
                              );
                            }
                          }
                          aria-label={`Remove keyword: ${previewSearchTerm}`}
                        >
                          <Image
                            alt=""
                            src="/trading-hub/asset/icon-remove-selected-chip.svg"
                            width={16}
                            height={16}
                          />
                        </RemoveKeyWordPill>
                      )}
                    </KeyWordPill>
                  </ModalSelectedKeyword>
                )}
                <KeywordList unfinishedKeyword={unfinishedKeyword}>
                  {filteredKeywords.map((keyword, index) => (
                    <KeyWordPill key={`${keyword}-${index}`} isSelected={false}>
                      <SelectKeywordPill
                        onClick={() => selectPreviewSearchTerm(keyword)}
                      >
                        <Typography variant="bodySmall" isStrong>
                          {keyword}
                        </Typography>
                      </SelectKeywordPill>
                      {writeEnabled && (
                        <RemoveKeyWordPill
                          onClick={() => removeSearchTerm(keyword)}
                          aria-label={`Remove keyword: ${keyword}`}
                        >
                          <Image
                            alt=""
                            src="/trading-hub/asset/icon-remove-chip.svg"
                            width={16}
                            height={16}
                          />
                        </RemoveKeyWordPill>
                      )}
                    </KeyWordPill>
                  ))}
                  {writeEnabled && (
                    <StyledInput
                      type="text"
                      value={inputValue}
                      placeholder="Add new keyword"
                      onChange={(event) =>
                        setInputValue(event.target.value.toLowerCase())
                      }
                      onKeyDown={(event) => {
                        setUnfinishedKeyword(false);
                        if (event.key === 'Enter') {
                          onAddKeyword();
                        }
                      }}
                      aria-label="Add keyword to list"
                      style={{
                        flex: '1',
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                  )}
                </KeywordList>
                {duplicationError && (
                  <ErrorMessage style={{ padding: 0 }}>
                    {duplicationError}
                  </ErrorMessage>
                )}
              </ModalWrapper>
            </ModalContainer>
          </Modal.Body>
          <ModalFooter>
            {unfinishedKeyword && (
              <ErrorContainer>
                <Image
                  alt=""
                  src="/trading-hub/asset/icon-warning.svg"
                  width={20}
                  height={20}
                />
                <ErrorText>Please finish adding the keyword to close</ErrorText>
              </ErrorContainer>
            )}
            <StyledCloseButton theme="secondary" onClick={handleClose}>
              Close
            </StyledCloseButton>
          </ModalFooter>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
