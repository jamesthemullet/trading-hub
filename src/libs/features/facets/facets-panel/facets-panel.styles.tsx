import styled from '@emotion/styled';
import React, { forwardRef, type ReactNode } from 'react';

import { Typography } from '@/libs/components/typography/typography';
import { spacing } from '@/libs/utils/spacing';

import styles from './facets-panel.module.css';

type RowProps = {
  children: ReactNode;
  className?: string;
  optionSelected?: 'included' | 'excluded' | 'algoControl';
} & React.HTMLAttributes<HTMLDivElement>;

export const Row = forwardRef<HTMLDivElement, RowProps>(
  ({ children, className = '', optionSelected, ...props }, ref) => (
    <div
      ref={ref}
      className={`${styles.facetTableRow} ${className}`}
      data-option={optionSelected}
      {...props}
    >
      {children}
    </div>
  )
);
Row.displayName = 'Row';

export const Col = ({
  children,
  className = '',
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <div className={`${styles.tableCol} ${styles.col} ${className}`}>
    {children}
  </div>
);

export const NoAttributesBlock = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`${styles.noAttributesBlock} ${className}`}>{children}</div>
);

export const SearchWrapper = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`${styles.searchWrapper} ${className}`}>{children}</div>;

export const ActionContainer = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 150px;
    text-align: center;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: ${spacing(2)};
`;

export const LowerHeading = ({
  children,
  className = '',
  isStrong = false,
}: {
  children: ReactNode;
  className?: string;
  isStrong?: boolean;
}) => (
  <Typography
    variant="bodyMedium"
    isStrong={isStrong}
    withMargin
    className={className}
  >
    {children}
  </Typography>
);

export const ScopeWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
  align-items: flex-end;
`;

export const Duration = styled.div`
  display: flex;
  flex-direction: column;

  label {
    margin-top: ${spacing(0.5)};
  }
`;

export const AttributesTable = styled.div`
  display: flex;
  flex-direction: column;
  margin: ${spacing(2)};
`;

export const SectionWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  margin-bottom: 0;
  border-radius: 4px;
  padding: ${spacing(2)};
`;

export const OrderColumn = styled.div`
  display: flex;
  gap: ${spacing(1)};
  padding-right: ${spacing(1)};
`;
