import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import styles from './toggle.module.css';

export const Toggle = (
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) => {
  return (
    <label className={styles.toggle} title="Toggle">
      <input type="checkbox" {...props} />
      <span />
    </label>
  );
};
