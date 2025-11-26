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
}: ErrorMessageProps) => (
  <Typography
    className={centred ? styles.centredError : styles.errorMessage}
    role="alert"
    {...rest}
  >
    {children}
  </Typography>
);
