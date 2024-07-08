import styled from '@emotion/styled';
import { useState } from 'react';

import { signIn, signOut, useSession } from 'next-auth/react';

import { Header3, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const navigationLightGreen = '#216d58';

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

  &:last-of-type {
    margin-top: auto;
  }
`;

const Link = styled.a<{ isOpen?: boolean }>`
  text-decoration: none;
  font-size: 12px;
  color: #fff;
  background-color: ${({ isOpen }) =>
    isOpen ? navigationLightGreen : color.darkHeritageGreen};
  border: none;
  display: flex;
  min-height: 64px;
  width: 64px;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 11;

  &:hover,
  &:focus {
    background-color: ${navigationLightGreen};
    outline: none;
  }
`;

const SubLink = styled(Link)`
  background-color: ${navigationLightGreen};
  width: 100%;
  justify-items: left;
  display: inline-block;

  &:hover,
  &:focus {
    background-color: ${color.darkHeritageGreen};
  }
`;

const Logo = styled.img`
  margin-top: ${spacing(3)};
  margin-left: ${spacing(1)};
  position: relative;
  z-index: 11;
`;

const Icon = styled.img``;

const SubMenu = styled.div<{ isVisible?: boolean }>`
  background-color: ${navigationLightGreen};
  width: 300px;
  height: 100vh;
  position: fixed;
  left: 64px;
  top: 0;
  padding-top: ${spacing(2)};
  transition: transform 0.1s ease-in 0s;
  transform: translate(${({ isVisible }) => (isVisible ? 0 : '-364px')}, 0px);

  & h3,
  & > a {
    color: #fff;
    padding: ${spacing(1)} ${spacing(2)};
    visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
  }
  a {
    min-height: 34px;
  }
  p {
    color: #fff;
  }
`;

export const Layout = styled.div`
  padding-left: ${spacing(8)};
`;

export const Navigation = () => {
  const session = useSession();
  const isLoggedIn = session && session.status === 'authenticated';
  const [openMenu, setOpenMenu] = useState(0);

  return (
    <NavigationWrapper>
      <Logo src="/trading-hub/asset/logo-no-date.svg" alt="M&S" />
      <List>
        <ListItem>
          <Link
            as="button"
            title="Category Ranking Rules"
            onClick={() => {
              setOpenMenu(openMenu === 1 ? 0 : 1);
            }}
            isOpen={!!openMenu && openMenu === 1}
          >
            <Icon src="/trading-hub/asset/menu-category-ranking.svg" />
          </Link>
          <SubMenu isVisible={!!openMenu && openMenu === 1}>
            <Header3>Category Ranking</Header3>
            <SubLink href="/category/rulesets">
              <Text>Ranking rules</Text>
            </SubLink>
            <SubLink href="/category/facets">
              <Text>Facets</Text>
            </SubLink>
          </SubMenu>

          <Link
            as="button"
            title="Search Ranking Rules"
            onClick={() => {
              setOpenMenu(openMenu === 2 ? 0 : 2);
            }}
            isOpen={!!openMenu && openMenu === 2}
          >
            <Icon src="/trading-hub/asset/menu-search.svg" />
          </Link>
          <SubMenu isVisible={!!openMenu && openMenu === 2}>
            <Header3>Search optimisation</Header3>
            <SubLink href="/search/rulesets">
              <Text>Ranking rules</Text>
            </SubLink>
          </SubMenu>

          <Link
            as="button"
            title="Setup"
            onClick={() => {
              setOpenMenu(openMenu === 3 ? 0 : 3);
            }}
            isOpen={!!openMenu && openMenu === 3}
          >
            <Icon src="/trading-hub/asset/menu-setup.svg" />
          </Link>
          <SubMenu isVisible={!!openMenu && openMenu === 3}>
            <Header3>Setup Global</Header3>
            <SubLink href="/global/rulesets">
              <Text>Global Category Ranking</Text>
            </SubLink>
            <SubLink href="/global/facets">
              <Text>Global Facet Management</Text>
            </SubLink>
          </SubMenu>
        </ListItem>
        <ListItem>
          <Link href="/" onClick={() => (isLoggedIn ? signOut() : signIn())}>
            <Text style={{ color: ' #fff' }}>
              {isLoggedIn ? 'Logout' : 'Login'}
            </Text>
          </Link>
        </ListItem>
      </List>
    </NavigationWrapper>
  );
};
