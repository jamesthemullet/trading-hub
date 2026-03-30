import { Typography } from '@/libs/components/typography/typography';
import { getRulesetEditRoute } from '@/libs/constants/routes';

import Link from 'next/link';

import styles from './history-list.module.css';

const HISTORY_COLUMNS = ['#', 'Date', 'Time', 'User', ''] as const;

type RuleType = 'categoryRanking' | 'searchRanking' | 'global' | 'redirect';

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
};

type HistoryItem = {
  rulesetId: string;
  id: string;
  date: string;
  user: string;
};

type HistoryRowProps = {
  item: HistoryItem;
  rowNumber: number;
  absoluteIndex: number;
  ruleType: RuleType;
};

const HistoryRow = ({
  item,
  rowNumber,
  absoluteIndex,
  ruleType,
}: HistoryRowProps) => {
  const date = new Date(item.date);
  const formattedDate = date.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);
  const formattedTime = date.toLocaleTimeString('en-GB', TIME_FORMAT_OPTIONS);
  const isLatest = absoluteIndex === 0;
  const linkText = isLatest ? 'Current version' : 'View version';
  const href = isLatest
    ? getRulesetEditRoute(ruleType, item.rulesetId)
    : `${getRulesetEditRoute(ruleType, item.rulesetId)}?history=true&historyId=${item.id}`;

  return (
    <li className={styles.historyRow} key={item.id}>
      <Typography variant="bodyMedium">{rowNumber}</Typography>
      <Typography variant="bodyMedium">
        {formattedDate}
        {isLatest && ' (current)'}
      </Typography>
      <Typography variant="bodyMedium">{formattedTime}</Typography>
      <Typography variant="bodyMedium">{item.user}</Typography>
      <Link href={href}>{linkText}</Link>
    </li>
  );
};

type HistoryListProps = {
  items: HistoryItem[];
  ruleType: RuleType;
  totalItems?: number;
  startIndex?: number;
};

export const HistoryList = ({
  items,
  ruleType,
  totalItems = items.length,
  startIndex = 0,
}: HistoryListProps) => {
  return (
    <ul className={styles.historyList}>
      <li className={styles.historyHeader}>
        {HISTORY_COLUMNS.map((column) => (
          <Typography key={column} variant="bodySmall" isStrong>
            {column}
          </Typography>
        ))}
      </li>
      {items.map((item, index) => (
        <HistoryRow
          key={item.id}
          item={item}
          rowNumber={totalItems - startIndex - index}
          absoluteIndex={startIndex + index}
          ruleType={ruleType}
        />
      ))}
    </ul>
  );
};
