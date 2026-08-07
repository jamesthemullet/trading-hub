import type {
  DetailedHTMLProps,
  InputHTMLAttributes,
  ReactElement,
} from 'react';

import styles from './toggle.module.css';

type ToggleProps = Omit<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
  'aria-label'
> & {
  'aria-label': string;
};

export const Toggle = (props: ToggleProps): ReactElement => {
  return (
    <label className={styles.toggle} title="Toggle">
      <input type="checkbox" {...props} />
      <span />
    </label>
  );
};
