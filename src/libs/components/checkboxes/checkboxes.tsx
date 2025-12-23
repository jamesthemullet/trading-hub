import { useId } from 'react';

import { formatHTMLStrings } from '@/libs/utils/format-html-strings';

import { Typography } from '../typography/typography';
import { Checkbox } from './checkbox';
import styles from './checkboxes.module.css';

type Value = {
  name: string;
  isSelected: boolean;
};

type Props = {
  values: Value[];
  onSelect: (isChecked: boolean, name: string) => void;
};

export const Checkboxes = ({ values, onSelect }: Props) => {
  const id = useId();

  return (
    <div>
      {values.length ? (
        values.map(({ name, isSelected }) => (
          <label
            className={styles.checkboxRow}
            key={name}
            htmlFor={`${id}-${name}`}
          >
            <Checkbox
              label={name}
              type="checkbox"
              checked={isSelected}
              id={`${id}-${name}`}
              onChange={() => onSelect(!isSelected, name)}
            />
            <Typography variant="bodySmall" as="span">
              {formatHTMLStrings(name)}
            </Typography>
          </label>
        ))
      ) : (
        <div className={styles.noResults}>
          <Typography variant="bodySmall">0 Results</Typography>
        </div>
      )}
    </div>
  );
};
