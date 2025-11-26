import styles from './count.module.css';

export const Count = ({
  children,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  'aria-label'?: string;
}) => (
  <output className={styles.count} aria-label={ariaLabel}>
    {children}
  </output>
);
