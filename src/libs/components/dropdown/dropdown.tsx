import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import { useCallback } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useOnOutsideClick } from '../../hooks/use-on-outside-click';
import { Icon } from '../icon/icon';
import { color } from '../utils/constants';
import { mediaQuery } from '../utils/media-query';
import { spacing } from '../utils/spacing';
import { sizing } from '../utils/sizing';
import { Text } from '../typography/typography.styles';

export type FilterDropdownProps = {
  isOpen: boolean;
  label: string;
  onOpen: () => void;
  onClose: (closingType?: ClosingType | 'tab') => void;
  children: ReactNode;
  contentWidth?: string;
  contentHeight?: string;
  alignContentTowards?: 'left' | 'right';
  footerContent?: ReactElement;
};

type ClosingType = 'icon' | 'button' | 'esc' | 'outsideClick';

const FilterDropdownWrapper = styled.div`
  position: relative;
  margin-bottom: ${spacing(2)};
  min-width: 125px;
`;

const FilterDropdownButton = styled.button<Pick<FilterDropdownProps, 'isOpen'>>`
  align-items: center;
  background: #e1e1e1;
  border: none;
  border-bottom: 1px solid #b1b1b1;
  border-radius: 4px 4px 0 0;
  display: flex;
  height: ${sizing(6)};
  justify-content: space-between;
  padding: 0 ${spacing(2)};
  width: ${sizing('100%')};
  &:hover {
    background-color: ${color.grey};
  }

  ${({ isOpen }) =>
    isOpen &&
    css`
      .icon {
        transform: rotate(180deg);
      }
    `};
`;

const ArrowIcon = styled(Icon)`
  margin-right: ${spacing(-2)};
  transition: 0.5s;
  isolation: isolate;
`;

const ContentWrapper = styled.div<
  Pick<FilterDropdownProps, 'alignContentTowards' | 'contentWidth' | 'isOpen'>
>`
  box-sizing: border-box;
  flex-direction: column;
  display: flex;
  position: absolute;
  width: ${({ contentWidth = sizing('100%') }) => contentWidth};
  z-index: 2;
  background: #fff;
  visibility: hidden;
  ${({ isOpen }) =>
    isOpen &&
    css`
      visibility: visible;
    `}
  ${({ alignContentTowards = 'left' }) => css`
    ${alignContentTowards}: 0;
  `}
  overflow: hidden;
  box-shadow: 0 4px 4px 0 rgba(0 0 0 / 20%);
`;

const Content = styled.div`
  overflow-y: auto;
  overscroll-behavior: contain;
  height: 100%;
  max-height: ${sizing(38)};

  ${mediaQuery('md')} {
    max-height: 40vh;
  }

  ${mediaQuery('lg')} {
    max-height: ${sizing(38)};
  }
`;

const ButtonText = styled(Text)`
  text-align: left;
  width: calc(100% - ${sizing(2)});
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  justify-content: center;
`;

export const Dropdown = ({
  children,
  label,
  onClose,
  onOpen,
  contentWidth,
  alignContentTowards,
  footerContent,
  isOpen,
}: FilterDropdownProps) => {
  const dropdownWrapperRef = useOnOutsideClick<HTMLDivElement>({
    handler: onClose,
    shouldEnableOutsideClick: isOpen,
  });

  const handleOnKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      return onClose('esc');
    }
  };

  const handleButtonOnKeyDown = (e: KeyboardEvent) => {
    if (isOpen && e.key === 'Tab' && e.shiftKey) {
      return onClose('tab');
    }
  };

  const handleOnClick = useCallback(() => {
    if (isOpen) {
      return onClose();
    }
    onOpen();
  }, [isOpen, onClose, onOpen]);

  return (
    <FilterDropdownWrapper onKeyDown={handleOnKeyDown} ref={dropdownWrapperRef}>
      <FilterDropdownButton
        onClick={handleOnClick}
        isOpen={isOpen}
        onKeyDown={handleButtonOnKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ButtonText as="span" color={'#000'}>
          {label}
        </ButtonText>
        <ArrowIcon name="ChevronDownDefault" color={'#000'} />
      </FilterDropdownButton>
      <ContentWrapper
        isOpen={isOpen}
        alignContentTowards={alignContentTowards}
        contentWidth={contentWidth}
        tabIndex={-1}
      >
        <Content tabIndex={-1}>{children}</Content>
        {footerContent}
      </ContentWrapper>
    </FilterDropdownWrapper>
  );
};
