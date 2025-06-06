import styled from '@emotion/styled';
import { useState } from 'react';

import Image from 'next/image';

import { Dropdown, DropdownOption } from '../dropdowns/dropdown/dropdown';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { labels } from './utils';

const DropdownWrapper = styled.div<{ isOperationDropdownOpen: boolean }>`
  border: none;
  border-bottom: 1px solid ${color.role.outline.outline};
  border-radius: 4px 4px 0 0;
  min-height: 56px;
  width: 150px;
  margin-right: ${spacing(1)};

  button {
    border: none;
    border-radius: 4px 4px 0 0;
    min-height: 56px;
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: ${spacing(1)};
    margin-top: 3px;
  }

  div {
    margin: 0;
    padding: 0;
  }
`;

const StyledDropdownOption = styled(DropdownOption)`
  font-size: 12px;
  align-items: end;
  width: 150px;
  box-shadow: none;
  background-color: #fff;
  border-radius: 0 !important;
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
    <DropdownWrapper isOperationDropdownOpen={isOperationDropdownOpen}>
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
                src="/trading-hub/asset/icon-include.svg"
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
                src="/trading-hub/asset/icon-exclude.svg"
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
