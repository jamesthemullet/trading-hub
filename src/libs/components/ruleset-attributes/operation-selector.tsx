import styled from '@emotion/styled';
import { useState } from 'react';

import Image from 'next/image';

import { Dropdown, DropdownOption } from '../dropdowns/dropdown/dropdown';
import { spacing } from '../utils/spacing';
import { labels } from './utils';

const DropdownWrapper = styled.div`
  margin-top: ${spacing(2)};
  margin-right: ${spacing(1)};
  margin-left: -${spacing(1)};
  min-width: 150px;

  button {
    &[aria-haspopup='listbox'] {
      background: none;
      border: solid 1px #000;
      border-radius: 5px;
      text-transform: capitalize;
      height: 40px;
    }
    span {
      font-size: 16px;
      justify-content: left;
    }
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: ${spacing(1)};
    margin-top: 3px;
  }
`;

const StyledDropdownOption = styled(DropdownOption)`
  font-size: 12px;
  align-items: end;
`;

export const OperationSelector = ({
  hasIncludeExclude,
  selectedOperation,
  setSelectedOperation,
}: {
  hasIncludeExclude: boolean;
  selectedOperation: 'boost' | 'bury' | 'include' | 'exclude';
  setSelectedOperation: (
    args: 'boost' | 'bury' | 'include' | 'exclude'
  ) => void;
}) => {
  const [isOperationDropdownOpen, setIsOperationDropdownOpen] = useState(false);

  const label = labels[selectedOperation];
  return (
    <DropdownWrapper>
      <Dropdown
        label={label.text}
        icon={label.icon}
        isOpen={isOperationDropdownOpen}
        onOpen={() => setIsOperationDropdownOpen(true)}
        onClose={
          // istanbul ignore next
          () => setIsOperationDropdownOpen(false)
        }
      >
        <StyledDropdownOption
          onClick={
            // istanbul ignore next
            () => {
              setIsOperationDropdownOpen(false);
              setSelectedOperation('boost');
            }
          }
        >
          <Image
            src="/trading-hub/asset/boost-signifier.svg"
            alt=""
            width={20}
            height={20}
          />
          Boost
        </StyledDropdownOption>
        <StyledDropdownOption
          onClick={() => {
            setIsOperationDropdownOpen(false);
            setSelectedOperation('bury');
          }}
        >
          <Image
            src="/trading-hub/asset/bury-signifier.svg"
            alt=""
            width={20}
            height={20}
          />
          Bury
        </StyledDropdownOption>
        {hasIncludeExclude && (
          <>
            <StyledDropdownOption
              onClick={() => {
                setIsOperationDropdownOpen(false);
                setSelectedOperation('include');
              }}
            >
              <Image
                src="/trading-hub/asset/icon-include-only.svg"
                alt=""
                width={20}
                height={20}
              />
              Include only
            </StyledDropdownOption>

            <StyledDropdownOption
              onClick={() => {
                setIsOperationDropdownOpen(false);
                setSelectedOperation('exclude');
              }}
            >
              <Image
                src="/trading-hub/asset/icon-exclude-only.svg"
                alt=""
                width={20}
                height={20}
              />
              Exclude only
            </StyledDropdownOption>
          </>
        )}
      </Dropdown>
    </DropdownWrapper>
  );
};
