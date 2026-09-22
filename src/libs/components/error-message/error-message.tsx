import type { ReactElement } from 'react';

import { Typography } from '../typography/typography';
import styles from './error-message.module.css';

type ErrorMessageProps = {
  children: React.ReactNode;
  isCentred?: boolean;
};

export const ErrorMessage = ({
  children,
  isCentred = false,
  ...rest
}: ErrorMessageProps): ReactElement => (
  <Typography
    className={isCentred ? styles.centredError : styles.errorMessage}
    role="alert"
    {...rest}
  >
    {children}
  </Typography>
);
