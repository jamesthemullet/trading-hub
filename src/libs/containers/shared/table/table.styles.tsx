import React, { type ReactNode } from 'react';

import styles from './table.module.css';

type TableRowProps = {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
};

type FacetAttributeValuesTableRowPropsNew = TableRowProps & {
  isPinned?: boolean;
  isExcluded?: boolean;
  modal?: boolean;
};

export const GlobalFacetAttributeValuesTableRow = React.forwardRef<
  HTMLDivElement,
  FacetAttributeValuesTableRowPropsNew
>(({ children, isPinned, isExcluded, modal, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`${styles.tableRow} ${styles.facetAttributeValuesTableRow} ${styles.globalFacetAttributeValuesTableRow} ${className || ''}`}
    data-is-pinned={isPinned}
    data-is-excluded={isExcluded}
    data-modal={modal}
    {...props}
  >
    {children}
  </div>
));
GlobalFacetAttributeValuesTableRow.displayName =
  'GlobalFacetAttributeValuesTableRow';

export const SearchCategoryFacetAttributeValuesTableRow = React.forwardRef<
  HTMLDivElement,
  FacetAttributeValuesTableRowPropsNew
>(({ children, isPinned, isExcluded, modal, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`${styles.tableRow} ${styles.facetAttributeValuesTableRow} ${styles.searchCategoryFacetAttributeValuesTableRow} ${className || ''}`}
    data-is-pinned={isPinned}
    data-is-excluded={isExcluded}
    data-modal={modal}
    {...props}
  >
    {children}
  </div>
));
SearchCategoryFacetAttributeValuesTableRow.displayName =
  'SearchCategoryFacetAttributeValuesTableRow';

export const EditFacetAttributesModalTableRow = ({
  children,
  className,
  ...props
}: TableRowProps) => (
  <div
    className={`${styles.tableRow} ${styles.editFacetAttributesModalTableRow} ${className || ''}`}
    {...props}
  >
    {children}
  </div>
);
