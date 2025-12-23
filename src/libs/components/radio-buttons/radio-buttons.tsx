import { Typography } from '../typography/typography';
import styles from './radio-buttons.module.css';

type Value = {
  name: string;
  isSelected: boolean;
};

type Props = {
  hasDivider: boolean;
  isBold: boolean;
  values: Value[];
  onSelect: (name: string) => void;
};

export const RadioButtons = ({
  hasDivider,
  isBold,
  values,
  onSelect,
}: Props) => (
  <div>
    {values.map(({ name, isSelected }) => (
      <label className={styles.row} key={name} data-has-divider={hasDivider}>
        <input
          className={styles.radio}
          type="radio"
          id={name}
          checked={isSelected}
          onChange={() => onSelect(name)}
        />
        <Typography aria-label={name} as="span" isStrong={isBold}>
          {name}
        </Typography>
      </label>
    ))}
  </div>
);
