import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { Typography } from '../typography/typography';
import styles from './heading.module.css';

type Props = {
  breadcrumbs: string[];
};

export const Heading = ({ breadcrumbs }: Props) => {
  return (
    <>
      <div className={styles.headingSpacer} />
      <div className={styles.headingWrapper}>
        <Breadcrumb>
          {breadcrumbs.map((breadcrumb) => (
            <Typography
              as="span"
              variant="bodySmall"
              className={styles.breadcrumbText}
              key={breadcrumb}
            >
              {breadcrumb}
            </Typography>
          ))}
        </Breadcrumb>
      </div>
    </>
  );
};
