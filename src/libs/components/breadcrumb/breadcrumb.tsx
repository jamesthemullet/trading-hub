import styled from '@emotion/styled';
import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

import { color } from '@/libs/utils/constants';
import { sizing } from '@/libs/utils/sizing';
import { spacing } from '@/libs/utils/spacing';

import { List } from './list';
import { VisuallyHide } from './visually-hide';

export type BreadcrumbProps = {
  children: ReactNode;
};

const StyledList = styled(List)`
  margin: 0 ${spacing(1)};
  overflow: visible;
  white-space: nowrap;

  li + li::before {
    display: inline-block;
    margin: 0 ${spacing(1)};
    transform: rotate(15deg) translateY(4px);
    border-right: 0.115rem solid ${color.lightGrey};
    height: ${sizing(2)};
    content: '';
  }

  li + li:nth-last-of-type(2)::before {
    margin: 0 ${spacing(1)};
  }
`;

const StyledListItem = styled.li`
  display: inline-block;
`;

export const Breadcrumb = ({ children }: BreadcrumbProps) => {
  const props = { 'aria-current': 'page' };
  return (
    <nav aria-label="breadcrumb">
      <VisuallyHide as="p">You are here:</VisuallyHide>
      <StyledList>
        {Children.map(children, (child, index) => {
          const element =
            isValidElement(child) && index === Children.count(children) - 1
              ? cloneElement(child as ReactElement, {
                  ...props,
                })
              : child;
          return <StyledListItem>{element}</StyledListItem>;
        })}
      </StyledList>
    </nav>
  );
};
