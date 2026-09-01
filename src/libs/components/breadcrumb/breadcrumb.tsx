import type { ReactElement, ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

import styles from './breadcrumb.module.css';

type BreadcrumbProps = {
  children: ReactNode;
};

export const Breadcrumb = ({ children }: BreadcrumbProps): ReactElement => {
  const props = { 'aria-current': 'page' };
  return (
    <nav aria-label="breadcrumb">
      <p className={styles.visuallyHide}>You are here:</p>
      <ul className={styles.list}>
        {Children.map(children, (child, index) => {
          const element =
            isValidElement(child) && index === Children.count(children) - 1
              ? cloneElement(child as ReactElement, {
                  ...props,
                })
              : child;
          return <li className={styles.listItem}>{element}</li>;
        })}
      </ul>
    </nav>
  );
};
