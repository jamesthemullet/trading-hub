import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

import type { MenuItem } from '../navigation-menu/navigation-menu';
import { NavigationMenu } from '../navigation-menu/navigation-menu';
import { Text } from '../typography/typography.styles';

const NavigationWrapper = styled.nav`
  background-color: ${color.surface.onSurface};
  z-index: 12;
  position: fixed;
`;

const LogoWrapper = styled.div`
  width: 100%;
  display: block;
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  height: calc(100vh - 60px);
`;

const ListItem = styled.li`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:last-of-type {
    margin-top: auto;
    flex-grow: 1;
    justify-content: flex-end;
    padding-bottom: ${spacing(2)};
  }
`;

const Logo = styled.img`
  margin: ${spacing(3)} auto;
  position: relative;
  display: block;
`;

const StyledLink = styled(Link)`
  min-height: 24px;
`;

export const Navigation = () => {
  const session = useSession();
  const isLoggedIn = session && session.status === 'authenticated';

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
  ];

  return (
    <NavigationWrapper>
      <LogoWrapper>
        <Logo
          src="/trading-hub/asset/logo-no-date.svg"
          alt="M&S"
          height={18}
          width={47}
        />
      </LogoWrapper>
      <List>
        <ListItem>
          <NavigationMenu menuItems={menuItems} />
        </ListItem>
        <ListItem>
          <StyledLink
            href="/"
            onClick={() => (isLoggedIn ? signOut() : signIn())}
            style={{ textDecoration: 'none' }}
            prefetch
          >
            <Text
              style={{
                color: '#fff',
                zIndex: 100,
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {isLoggedIn ? 'Sign out' : 'Sign in'}
            </Text>
          </StyledLink>
        </ListItem>
      </List>
    </NavigationWrapper>
  );
};
