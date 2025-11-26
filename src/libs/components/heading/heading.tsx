import { Breadcrumb } from '../breadcrumb/breadcrumb';
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
            <span className={styles.breadcrumbText} key={breadcrumb}>
              {breadcrumb}
            </span>
          ))}
        </Breadcrumb>
      </div>
    </>
  );
};
