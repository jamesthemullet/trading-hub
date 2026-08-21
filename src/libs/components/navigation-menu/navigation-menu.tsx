import type { ReactElement } from 'react';

import { Typography } from '@/libs/components';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './navigation-menu.module.css';

export type MenuItem = {
  title: string;
  path: string;
  pathExcludes?: string;
  icon: string;
  activeIcon: string;
  alt: string;
  shortTitle: string;
}[];

type MenuItems = {
  menuItems: MenuItem;
};

export const NavigationMenu = ({ menuItems }: MenuItems): ReactElement => {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((menuItem) => {
        const isActive = menuItem.pathExcludes
          ? pathname?.includes(menuItem.path) &&
            !pathname.includes(menuItem.pathExcludes)
          : pathname?.includes(menuItem.path);

        return (
          <div key={menuItem.title} className={styles.menuItem}>
            <Link
              className={styles.styledLink}
              data-is-active={isActive}
              title={menuItem.title}
              href={menuItem.path}
            >
              {isActive ? (
                <Image
                  src={menuItem.activeIcon}
                  alt=""
                  height={25}
                  width={25}
                />
              ) : (
                <Image src={menuItem.icon} alt="" height={25} width={25} />
              )}
              <Typography align="center" variant="bodySmall">
                {menuItem.shortTitle}
              </Typography>
            </Link>
          </div>
        );
      })}
    </>
  );
};
