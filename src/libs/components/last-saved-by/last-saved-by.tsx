import { Typography } from '@/libs/components/typography/typography';

import styles from './last-saved-by.module.css';

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
};

export type LastChanged = {
  date: string;
  user: string;
};

type Props = {
  lastChanged?: LastChanged;
  className?: string;
};

export const LastSavedBy = ({ lastChanged, className }: Props) => {
  const lastChangedDate = lastChanged?.date ? new Date(lastChanged.date) : null;

  const isLastChangedValid =
    !!lastChangedDate &&
    !Number.isNaN(lastChangedDate.getTime()) &&
    !!lastChanged?.user;

  if (!isLastChangedValid || !lastChangedDate) {
    return null;
  }

  return (
    <Typography
      variant="bodySmall"
      className={[styles.lastSaved, className].filter(Boolean).join(' ')}
    >
      {'Last saved by: '}
      <Typography as="span" variant="bodySmall" isStrong>
        {lastChanged?.user}
      </Typography>{' '}
      <span className={styles.separator} aria-hidden="true">
        •
      </span>
      {` ${lastChangedDate.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS)} at ${lastChangedDate.toLocaleTimeString('en-GB', TIME_FORMAT_OPTIONS)}`}
    </Typography>
  );
};
