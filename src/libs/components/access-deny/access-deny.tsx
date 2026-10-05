import type { ReactElement, ReactNode } from 'react';

import { ADMIN_TEAMS_URL } from '@/libs/constants/admin-contact';

import styles from './access-deny.module.css';

export const AccessDeny = ({
  requiredRole,
  message,
}: {
  requiredRole?: string;
  message?: ReactNode;
}): ReactElement => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        {message ?? (
          <>
            You don&apos;t have access to this Page,{' '}
            <a href={ADMIN_TEAMS_URL}>
              please contact admin on our teams channel
            </a>{' '}
            to acquire
            {requiredRole ? ` "${requiredRole}" access role` : ' access'} in
            order to see this resource.
          </>
        )}
      </div>
    </div>
  );
};
