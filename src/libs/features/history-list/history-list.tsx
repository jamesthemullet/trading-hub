import { Typography } from '@/libs/components/typography/typography';

import styles from './history-list.module.css';

const HISTORY_COLUMNS = ['#', 'Date', 'Time', 'User'] as const;

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

export type HistoryItem = {
  id: string;
  date: string;
  user: string;
};

type HistoryRowProps = {
  item: HistoryItem;
  index: number;
  total: number;
};

const HistoryRow = ({ item, index, total }: HistoryRowProps) => {
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  const formattedTime = date.toLocaleTimeString('en-GB', TIME_FORMAT_OPTIONS);
  const isLatest = index === 0;

  return (
    <li className={styles.historyRow} key={item.id}>
      <Typography variant="bodyMedium">{total - index}</Typography>
      <Typography variant="bodyMedium">
        {formattedDate}
        {isLatest && ' (current)'}
      </Typography>
      <Typography variant="bodyMedium">{formattedTime}</Typography>
      <Typography variant="bodyMedium">{item.user}</Typography>
      <span />
    </li>
  );
};

type HistoryListProps = {
  items: HistoryItem[];
};

export const HistoryList = ({ items }: HistoryListProps) => {
  return (
    <ul className={styles.historyList}>
      <li className={styles.historyHeader}>
        {HISTORY_COLUMNS.map((column) => (
          <Typography key={column} variant="bodySmall" isStrong>
            {column}
          </Typography>
        ))}
        <span />
      </li>
      {items.map((item, index) => (
        <HistoryRow
          key={item.id}
          item={item}
          index={index}
          total={items.length}
        />
      ))}
    </ul>
  );
};
