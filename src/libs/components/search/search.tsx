import { type ChangeEventHandler, type RefObject, useState } from 'react';

import { Input, type InputProps } from '@/libs/containers/shared/input/input';

import Image from 'next/image';

import styles from './search.module.css';

type SearchProps = {
  id?: string;
  name?: string;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  fullWidth?: boolean;
};

export const Search = ({
  name,
  id,
  value,
  onChange,
  placeholder,
  fullWidth,
}: SearchProps) => {
  const [currentValue, setCurrentValue] = useState('');

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentValue(event.target.value);

    onChange?.(event);
  };

  return (
    <div className={styles.searchBoxContainer} data-full-width={fullWidth}>
      <SearchBox
        inputProps={{
          isLabelHidden: true,
          label: name || 'Search category identifier or user name',
          placeholder: placeholder || 'Search...',
          required: true,
          id: id || 'searchId',
          name: name || 'searchTerm',
          onChange: handleOnChange,
          autoComplete: 'off',
          autoCapitalize: 'off',
          autoCorrect: 'off',
          value: value ?? currentValue,
        }}
      />
    </div>
  );
};

type SearchBoxProps = {
  inputProps: {
    ref?: RefObject<HTMLInputElement>;
  } & InputProps;
};

export const SearchBox = ({ inputProps }: SearchBoxProps) => {
  const handleClear = () => {
    if (inputProps.onChange) {
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      inputProps.onChange(syntheticEvent);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Image
        src="/trading-hub/asset/icon-search.svg"
        alt=""
        width={20}
        height={20}
        className={styles.searchIcon}
      />
      <Input className={styles.input} type="search" {...inputProps} />
      {inputProps.value && (
        <button
          className={styles.clearButton}
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <Image
            src="/trading-hub/asset/icon-x.svg"
            alt=""
            width={14}
            height={14}
          />
        </button>
      )}
    </div>
  );
};
