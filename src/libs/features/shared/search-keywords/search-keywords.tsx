import {
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useState,
} from 'react';
import { Modal } from '@mantine/core';

import { Button, Count, ErrorMessage } from '@/libs/components';
import dropdownStyles from '@/libs/components/dropdown/dropdown.module.css';
import { SearchBox } from '@/libs/components/search/search';
import { Typography } from '@/libs/components/typography/typography';
import { Input } from '@/libs/containers/shared/input/input';
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
  isWriteEnabled: boolean;
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
  isWriteEnabled,
}: Props): ReactElement => {
  const [shouldShowModal, setShouldShowModal] = useState(false);

  const [keywordInputResetKey, setKeywordInputResetKey] = useState(0);
  const [duplicationError, setDuplicationError] = useState('');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: () => setIsDropdownOpen(false),
  });

  const [filterValue, setFilterValue] = useState('');
  const [filteredKeywords, setFilteredKeywords] =
    useState<string[]>(searchTerms);
  const [isUnfinishedKeyword, setIsUnfinishedKeyword] =
    useState<boolean>(false);

  const onClose = () => {
    setShouldShowModal(false);
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
    const inputElement = document.getElementById(
      'newKeywordInput'
    ) as HTMLInputElement | null;
    const inputValue = inputElement?.value.trim().toLowerCase() ?? '';

    if (inputValue === '') {
      setDuplicationError('Keyword cannot be blank');
      return;
    }

    const hasDuplicates = checkForDuplicates(
      [...searchTerms],
      inputValue,
      'keyword'
    );

    if (hasDuplicates) {
      setDuplicationError(hasDuplicates);
    } else {
      addSearchTerm(inputValue);
      setKeywordInputResetKey((prev) => prev + 1);
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
    const inputElement = document.getElementById(
      'newKeywordInput'
    ) as HTMLInputElement | null;

    if (!inputElement?.value) {
      onClose();
    } else {
      setIsUnfinishedKeyword(true);
    }
  };

  const additionalSearchTerms = searchTerms.filter(
    (term) => term !== previewSearchTerm
  );

  return (
    <>
      <div>
        <Typography withMargin variant="labelMedium">
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
                searchTerms.length > 1
                  ? setIsDropdownOpen(!isDropdownOpen)
                  : setShouldShowModal(true)
              }
              aria-haspopup="menu"
              aria-expanded={isDropdownOpen}
              aria-label="select keyword"
              isDisabled={!previewSearchTerm}
              onKeyDown={handleOnKeyDown}
            >
              <Typography as="span" variant="bodySmall">
                {previewSearchTerm || 'Add search terms to display here'}
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
            onClick={() => setShouldShowModal(true)}
            isDisabled={!isWriteEnabled}
          >
            Edit
          </Button>
        </div>
      </div>

      <Modal.Root
        opened={shouldShowModal}
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
                {isWriteEnabled && (
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
                  <div className={styles.modalSelectedKeyword}>
                    <Typography as="h3" variant="bodyMedium">
                      Selected:
                    </Typography>
                    <div data-is-selected="true" className={styles.keywordPill}>
                      <Typography variant="bodySmall" isStrong>
                        {previewSearchTerm}
                      </Typography>
                      {isWriteEnabled && (
                        <Button
                          appearance="icon"
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
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <ul className={styles.keywordList}>
                  {filteredKeywords.map((keyword) => (
                    <li
                      key={keyword}
                      data-is-selected="false"
                      className={styles.keywordPill}
                    >
                      <Button
                        appearance="plain"
                        type="button"
                        onClick={() => selectPreviewSearchTerm(keyword)}
                      >
                        <Typography variant="bodySmall" isStrong>
                          {keyword}
                        </Typography>
                      </Button>
                      {isWriteEnabled && (
                        <Button
                          appearance="icon"
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
                        </Button>
                      )}
                    </li>
                  ))}
                  {isWriteEnabled && (
                    <li className={styles.keywordInputItem}>
                      <Input
                        id="newKeywordInput"
                        key={keywordInputResetKey}
                        label="Add keyword to list"
                        isLabelHidden
                        type="text"
                        className={styles.keywordInput}
                        size="small"
                        placeholder="Add new keyword"
                        onChange={() => {
                          setIsUnfinishedKeyword(false);
                        }}
                        onKeyDown={(event) => {
                          setIsUnfinishedKeyword(false);
                          if (event.key === 'Enter') {
                            onAddKeyword();
                          }
                        }}
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
            {isUnfinishedKeyword && (
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
