import styled from '@emotion/styled';
import { signIn, signOut, useSession } from 'next-auth/react';
import { spacing } from '../utils/spacing';
import { colourDictionary } from '../utils/constants';

const NavigationWrapper = styled.div`
  width: ${spacing(8)};
  background: ${colourDictionary.green[800]};
  color: ${colourDictionary.white};
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
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

const Link = styled.a`
  text-decoration: none;
  font-size: 12px;
  color: ${colourDictionary.white};
  display: inline-block;
`;

const Text = styled.span`
  margin: ${spacing(1)};
  text-align: center;
`;

const Logo = styled.img`
  margin-top: ${spacing(3)};
  margin-left: ${spacing(1)};
`;

const Icon = styled.img`
  margin-top: ${spacing(1)};
  margin-left: 17px;
`;

export const Layout = styled.div`
  padding-left: ${spacing(8)};
`;

export const Navigation = () => {
  const session = useSession();
  const isLoggedIn = session && session.status === 'authenticated';

  return (
    <NavigationWrapper>
      <Logo src="/trading-hub/asset/logo-no-date.svg" alt="M&S" />
      <List>
        <ListItem>
          <Link href="/rules" title="Search Ranking Rules">
            <Icon
              title="Category Ranking Rules"
              src="/trading-hub/asset/menu-category-ranking.svg"
            />
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/" onClick={() => (isLoggedIn ? signOut() : signIn())}>
            <Text>{isLoggedIn ? 'Logout' : 'Login'}</Text>
          </Link>
        </ListItem>
      </List>
    </NavigationWrapper>
  );
};
