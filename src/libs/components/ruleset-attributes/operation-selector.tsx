import styled from '@emotion/styled';
import { useState } from 'react';

import {
  CombinedDropdown,
  DropdownOption,
  ImageWrapper,
} from '@/libs/components';

import Image from 'next/image';

import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { labels } from './utils';

const DropdownWrapper = styled.div`
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

  div {
    margin: 0;
    padding: 0;
  }
`;

const StyledDropdownOption = styled(DropdownOption)`
  font-size: 12px;
  align-items: center;
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
  const [closeDropdown, setCloseDropdown] = useState(false);

  const label = labels[selectedOperation];

  return (
    <DropdownWrapper>
      <CombinedDropdown
        variant="generic"
        label={label.text}
        icon={label.icon}
        width={150}
        ariaLabel={`Select to ${hasIncludeExclude ? 'include, exclude, ' : ''}boost or bury`}
        closeFromChild={closeDropdown}
        onOpen={() => {
          setCloseDropdown(false);
        }}
      >
        <StyledDropdownOption
          onClick={() => {
            setCloseDropdown(true);
            setSelectedOperation('boost');
          }}
        >
          <ImageWrapper>
            <Image
              src="/trading-hub/asset/boost-signifier.svg"
              alt=""
              width={20}
              height={20}
            />
          </ImageWrapper>
          Boost
        </StyledDropdownOption>
        <StyledDropdownOption
          onClick={() => {
            setCloseDropdown(true);
            setSelectedOperation('bury');
          }}
        >
          <ImageWrapper>
            <Image
              src="/trading-hub/asset/bury-signifier.svg"
              alt=""
              width={20}
              height={20}
            />
          </ImageWrapper>
          Bury
        </StyledDropdownOption>
        {hasIncludeExclude && (
          <>
            <StyledDropdownOption
              onClick={() => {
                setCloseDropdown(true);
                setSelectedOperation('include');
              }}
            >
              <ImageWrapper>
                <Image
                  src="/trading-hub/asset/icon-include.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </ImageWrapper>
              Include only
            </StyledDropdownOption>

            <StyledDropdownOption
              onClick={() => {
                setCloseDropdown(true);
                setSelectedOperation('exclude');
              }}
            >
              <ImageWrapper>
                <Image
                  src="/trading-hub/asset/icon-exclude.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </ImageWrapper>
              Exclude only
            </StyledDropdownOption>
          </>
        )}
      </CombinedDropdown>
    </DropdownWrapper>
  );
};
