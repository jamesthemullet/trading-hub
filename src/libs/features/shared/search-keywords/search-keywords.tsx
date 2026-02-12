import { type KeyboardEvent, useEffect, useState } from 'react';
import { Modal } from '@mantine/core';

import { Button, Count, ErrorMessage } from '@/libs/components';
import dropdownStyles from '@/libs/components/dropdown/dropdown.module.css';
import { SearchBox } from '@/libs/components/search/search';
import { Typography } from '@/libs/components/typography/typography';
import { useOnOutsideClick } from '@/libs/hooks';
import { checkForDuplicates } from '@/libs/utils/check-for-duplicates';

import Image from 'next/image';

const DEFAULT_DROPDOWN_WIDTH = 250;
const ACTIVE_DROPDOWN_WIDTH = 320;

import styles from './search-keywords.module.css';

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

  const handleOnKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    // istanbul ignore else
    if (event.key === 'Escape' && isDropdownOpen) {
      event.preventDefault();
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
        <div className={styles.searchBoxContainer}>
          <div
            className={dropdownStyles.dropdownWrapper}
            data-has-border-bottom="false"
            data-is-dropdown-open={isDropdownOpen}
            data-width={
              previewSearchTerm ? DEFAULT_DROPDOWN_WIDTH : ACTIVE_DROPDOWN_WIDTH
            }
            data-height="large"
            ref={dropdownWrapperRef}
          >
            <Button
              type="button"
              className={dropdownStyles.dropdownButton}
              data-is-dropdown-open={isDropdownOpen}
              onClick={() =>
                sortedSearchTerms.length > 1
                  ? setIsDropdownOpen(!isDropdownOpen)
                  : setShowModal(true)
              }
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              aria-label="select keyword"
              disabled={!previewSearchTerm}
              onKeyDown={handleOnKeyDown}
            >
              <Typography as="span" variant="bodySmall">
                {previewSearchTerm
                  ? previewSearchTerm
                  : 'Add categories to display here'}
              </Typography>
              <div className={dropdownStyles.arrowContainer}>
                <span
                  className={dropdownStyles.arrow}
                  data-is-dropdown-open={isDropdownOpen}
                />
              </div>
            </Button>

            {isDropdownOpen && (
              <div
                className={dropdownStyles.dropdownContentContainer}
                data-is-dropdown-open={isDropdownOpen}
                role="menu"
              >
                {additionalSearchTerms.map((searchTerm) => (
                  <Button
                    className={dropdownStyles.dropdownOption}
                    type="button"
                    key={`search-term-${searchTerm}`}
                    data-hover-grey
                    role="menuitem"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      selectPreviewSearchTerm(searchTerm);
                    }}
                  >
                    <Typography
                      className={styles.dropdownText}
                      variant="bodySmall"
                    >
                      {searchTerm}
                    </Typography>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Button
            theme="filled"
            isInline
            onClick={() => setShowModal(true)}
            isDisabled={!writeEnabled}
          >
            Edit
          </Button>
        </div>
      </div>

      <Modal.Root
        opened={showModal}
        onClose={onClose}
        centered
        padding={20}
        size="auto"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content aria-label="Search Keywords Modal">
          <Modal.Body>
            <div className={styles.modal}>
              <div className={styles.modalWrapper}>
                <Typography variant="titleSmall" isStrong withMargin as="h2">
                  {title}
                </Typography>
                {writeEnabled && (
                  <div className={styles.modalSearchBoxContainer}>
                    <SearchBox
                      inputProps={{
                        id: 'searchId',
                        label: '',
                        placeholder: 'Search...',
                        value: filterValue,
                        onChange: (
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          setFilterValue(event.target.value);
                        },
                      }}
                    />
                  </div>
                )}
                {previewSearchTerm && (
                  <div
                    className={styles.modalSelectedKeyword}
                    aria-label="Preview keyword"
                  >
                    <Typography as="h3" variant="bodyMedium">
                      Selected:
                    </Typography>
                    <div data-is-selected="true" className={styles.keywordPill}>
                      <Typography variant="bodySmall" isStrong>
                        {previewSearchTerm}
                      </Typography>
                      {writeEnabled && (
                        <button
                          className={styles.removeKeywordButton}
                          type="submit"
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
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <ul className={styles.keywordList}>
                  {filteredKeywords.map((keyword, index) => (
                    <li
                      key={`${keyword}-${index}`}
                      data-is-selected="false"
                      className={styles.keywordPill}
                    >
                      <button
                        className={styles.selectKeywordButton}
                        type="button"
                        onClick={() => selectPreviewSearchTerm(keyword)}
                      >
                        <Typography variant="bodySmall" isStrong>
                          {keyword}
                        </Typography>
                      </button>
                      {writeEnabled && (
                        <button
                          className={styles.removeKeywordButton}
                          type="submit"
                          onClick={() => removeSearchTerm(keyword)}
                          aria-label={`Remove keyword: ${keyword}`}
                        >
                          <Image
                            alt=""
                            src="/trading-hub/asset/icon-remove-chip.svg"
                            width={16}
                            height={16}
                          />
                        </button>
                      )}
                    </li>
                  ))}
                  {writeEnabled && (
                    <li className={styles.keywordInputItem}>
                      <input
                        type="text"
                        className={styles.keywordInput}
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
                      />
                    </li>
                  )}
                </ul>
              </div>
            </div>
            {duplicationError && (
              <ErrorMessage>{duplicationError}</ErrorMessage>
            )}
          </Modal.Body>
          <div className={styles.modalFooter}>
            {unfinishedKeyword && (
              <div className={styles.errorContainer}>
                <Image
                  alt=""
                  src="/trading-hub/asset/icon-warning.svg"
                  width={20}
                  height={20}
                />
                <ErrorMessage>
                  Please finish adding the keyword to close
                </ErrorMessage>
              </div>
            )}
            <Button theme="secondary" onClick={handleClose} type="submit">
              Close
            </Button>
          </div>
        </Modal.Content>
      </Modal.Root>
    </>
  );
};
