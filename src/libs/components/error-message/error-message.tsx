import type { ReactElement } from 'react';

import { Typography } from '../typography/typography';
import styles from './error-message.module.css';

type ErrorMessageProps = {
  children: React.ReactNode;
  centred?: boolean;
};

export const ErrorMessage = ({
  children,
  centred = false,
  ...rest
}: ErrorMessageProps): ReactElement => (
  <Typography
    className={centred ? styles.centredError : styles.errorMessage}
    role="alert"
    {...rest}
  >
    {children}
  </Typography>
);
