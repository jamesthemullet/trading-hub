import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { List } from './list';
import { VisuallyHide } from './visually-hide';
import { spacing } from '../utils/spacing';
import { color } from '../utils/constants';
import { sizing } from '../utils/sizing';
import { mediaQuery } from '../utils/media-query.styles';

export type BreadcrumbProps = {
  children: ReactNode;
  shouldUnderlineLastElement?: boolean;
};

const StyledList = styled(List)`
  position: relative;
  white-space: nowrap;
  overflow: hidden;

  li + li::before {
    display: inline-block;
    margin: 0 ${spacing(1)};
    transform: rotate(15deg) translateY(4px);
    border-right: 0.115rem solid ${color.lightGrey};
    height: ${sizing(2)};
    content: '';
  }
  li + li:nth-last-of-type(2)::before {
    margin: 0 ${spacing(1)} 0 0.2rem;
  }

  ${mediaQuery('md')} {
    overflow: visible;
    li + li:nth-last-of-type(2)::before {
      margin: 0 ${spacing(1)};
    }
  }
`;

const StyledListItem = styled.li<
  Pick<BreadcrumbProps, 'shouldUnderlineLastElement'> & {
    listLength: number;
  }
>`
  display: none;

  &:nth-last-of-type(2),
  &:nth-last-of-type(1) {
    display: inline-block;
  }

  ${mediaQuery('md')} {
    display: inline-block;

    &:nth-last-of-type(2) {
      a {
        padding-left: 0;
        background: none;
      }
    }
  }
  a {
    text-decoration: none;
    :hover {
      text-decoration: none;
    }
  }
  ${({ shouldUnderlineLastElement }) =>
    shouldUnderlineLastElement &&
    css`
      :last-child {
        a {
          text-decoration: underline;
        }
      }
    `}
`;

export const Breadcrumb = ({
  children,
  shouldUnderlineLastElement = false,
}: BreadcrumbProps) => {
  return (
    <nav aria-label="breadcrumb">
      <VisuallyHide as="p">You are here:</VisuallyHide>
      <StyledList isUnstyled>
        {Children.map(children, (child, index) => {
          const element =
            isValidElement(child) && index === Children.count(children) - 1
              ? cloneElement(child as ReactElement, {
                  'aria-current': 'page',
                })
              : child;
          return (
            <StyledListItem
              shouldUnderlineLastElement={shouldUnderlineLastElement}
              listLength={Children.count(children)}
            >
              {element}
            </StyledListItem>
          );
        })}
      </StyledList>
    </nav>
  );
};
