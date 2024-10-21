import styled from '@emotion/styled';

import Link from 'next/link';
import { signIn, signOut, useSession } from 'next-auth/react';

import { NavigationMenu } from '../navigation-menu/navigation-menu';
import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const NavigationWrapper = styled.div`
  width: ${spacing(8)};
  background-color: ${color.darkHeritageGreen};
  color: #fff;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11;

  &::before {
    content: '';
    width: ${spacing(8)};
    height: 100vh;
    background-color: ${color.darkHeritageGreen};
    display: block;
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: ${spacing(4)} 0 0;
  display: flex;
  flex-wrap: wrap;
  height: calc(100vh - 70px);
`;

const ListItem = styled.li`
  margin-bottom: ${spacing(2)};
  width: 100%;

  &:last-of-type {
    margin-top: auto;
  }
`;

const Logo = styled.img`
  margin-top: ${spacing(3)};
  margin-left: ${spacing(1)};
  position: relative;
  z-index: 11;
`;

export const Layout = styled.div`
  padding-left: ${spacing(8)};
`;

export const Navigation = () => {
  const session = useSession();
  const isLoggedIn = session && session.status === 'authenticated';

  const menuItems = [
    {
      title: 'Category Ranking Rules',
      path: '/category/',
      icon: '/trading-hub/asset/menu-category-ranking-v2.svg',
      activeIcon: '/trading-hub/asset/menu-category-ranking-v2-active.svg',
      subLinks: [
        { href: '/category/rulesets', text: 'Ranking rules' },
        { href: '/category/facets', text: 'Facets' },
      ],
    },
    {
      title: 'Search Ranking Rules',
      path: '/search/',
      icon: '/trading-hub/asset/menu-search-v2.svg',
      activeIcon: '/trading-hub/asset/menu-search-v2-active.svg',
      subLinks: [
        { href: '/search/rulesets', text: 'Ranking rules' },
        { href: '/search/redirects', text: 'Redirect' },
      ],
    },
    {
      title: 'Setup',
      path: '/global/',
      icon: '/trading-hub/asset/menu-setup-v2.svg',
      activeIcon: '/trading-hub/asset/menu-setup-v2-active.svg',
      subLinks: [
        { href: '/global/rulesets', text: 'Global Category Ranking' },
        { href: '/global/facets', text: 'Global Facet Management' },
      ],
    },
  ];

  return (
    <NavigationWrapper>
      <Logo src="/trading-hub/asset/logo-no-date.svg" alt="M&S" />
      <List>
        <ListItem>
          <NavigationMenu menuItems={menuItems} />
        </ListItem>
        <ListItem>
          <Link
            href="/"
            onClick={() => (isLoggedIn ? signOut() : signIn())}
            style={{ textDecoration: 'none' }}
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
              {isLoggedIn ? 'Logout' : 'Login'}
            </Text>
          </Link>
        </ListItem>
      </List>
    </NavigationWrapper>
  );
};
