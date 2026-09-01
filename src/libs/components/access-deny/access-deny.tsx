import type { ReactElement } from 'react';

import styles from './access-deny.module.css';

export const AccessDeny = ({
  requiredRole,
}: {
  requiredRole?: string;
}): ReactElement => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        You don&apos;t have access to this Page,{' '}
        <a href="https://teams.microsoft.com/l/channel/19%3A69011a4ab2784a5b8c74bc7ad61472d7%40thread.tacv2/%5BSquad%5D%20Search%20-%20General?groupId=09be67e3-2208-45f2-9eaf-41d6c22743bb&tenantId=bd5c6713-7399-4b31-be79-78f2d078e543">
          please contact admin on our teams channel
        </a>{' '}
        to acquire
        {requiredRole ? ` "${requiredRole}" access role` : ' access'} in order
        to see this resource.
      </div>
    </div>
  );
};
