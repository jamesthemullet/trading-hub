import { Button, Typography } from '@/libs/components';

import Image from 'next/image';
import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

import type { MenuItem } from '../navigation-menu/navigation-menu';
import { NavigationMenu } from '../navigation-menu/navigation-menu';
import styles from './navigation.module.css';

export const Navigation = () => {
  const session = useSession();
  const isLoggedIn = session?.status === 'authenticated';

  const menuItems: MenuItem = [
    {
      title: 'Category Rules',
      path: '/category',
      icon: '/trading-hub/asset/menu-category-ranking-v2.svg',
      activeIcon: '/trading-hub/asset/menu-category-ranking-v2-active.svg',
      alt: 'Category Ranking Rules',
      shortTitle: 'Categories',
    },
    {
      title: 'Search Ranking Rules',
      path: '/search',
      pathExcludes: 'redirects',
      icon: '/trading-hub/asset/menu-search-v2.svg',
      activeIcon: '/trading-hub/asset/menu-search-v2-active.svg',
      alt: 'Search Ranking Rules',
      shortTitle: 'Search',
    },
    {
      title: 'Redirect Rules',
      path: '/search/redirects',
      icon: '/trading-hub/asset/menu-redirect-arrow.svg',
      activeIcon: '/trading-hub/asset/menu-redirect-arrow-active.svg',
      alt: 'Redirect Rules',
      shortTitle: 'Redirect',
    },
    {
      title: 'Global Ranking Rules',
      path: '/global',
      icon: '/trading-hub/asset/menu-globe.svg',
      activeIcon: '/trading-hub/asset/menu-globe-active.svg',
      alt: 'Global Ranking Rules',
      shortTitle: 'Global',
    },
    {
      title: 'Product Status',
      path: '/product-status',
      icon: '/trading-hub/asset/menu-product-status.svg',
      activeIcon: '/trading-hub/asset/menu-product-status.svg',
      alt: '',
      shortTitle: 'Product Status',
    },
  ];

  return (
    <nav className={styles.navigationWrapper}>
      <div>
        <Image
          className={styles.logo}
          src="/trading-hub/asset/logo-no-date.svg"
          alt="M&S"
          height={18}
          width={47}
        />
      </div>
      <ul className={styles.navigationList}>
        <li className={styles.navigationListItem}>
          <NavigationMenu menuItems={menuItems} />
        </li>
        <li className={styles.navigationListItem}>
          {isLoggedIn ? (
            <Button
              type="button"
              appearance="plain"
              className={styles.link}
              onClick={() => signOut({ callbackUrl: '/api/auth/azure-logout' })}
            >
              <Typography variant="bodySmall">Sign out</Typography>
            </Button>
          ) : (
            <Link
              className={styles.link}
              href="/"
              onClick={() => signIn()}
              style={{ textDecoration: 'none' }}
              prefetch
            >
              <Typography variant="bodySmall">Sign in</Typography>
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};
