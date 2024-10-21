import styled from '@emotion/styled';
import { useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Header3, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const navigationLightGreen = '#216d58';

const StyledLink = styled.a<{ isOpen?: boolean }>`
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
  text-decoration: none;

  &:hover,
  &:focus {
    background-color: ${color.darkHeritageGreen};
  }
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

type MenuItems = {
  menuItems: {
    title: string;
    path: string;
    icon: string;
    activeIcon: string;
    subLinks: {
      href: string;
      text: string;
    }[];
  }[];
};

export const NavigationMenu = ({ menuItems }: MenuItems) => {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(0);

  return (
    <>
      {menuItems.map((menuItem, index) => (
        <div key={menuItem.title}>
          <StyledLink
            as="button"
            title={menuItem.title}
            aria-label={menuItem.title}
            onClick={() => setOpenMenu(openMenu === index + 1 ? 0 : index + 1)}
            isOpen={openMenu === index + 1}
          >
            {pathname.includes(menuItem.path) ? (
              <Icon src={menuItem.activeIcon} />
            ) : (
              <Icon src={menuItem.icon} />
            )}
          </StyledLink>
          <SubMenu isVisible={openMenu === index + 1}>
            <Header3>{menuItem.title}</Header3>
            {menuItem.subLinks.map((subLink) => (
              <SubLink
                href={subLink.href}
                onClick={() => setOpenMenu(0)}
                key={subLink.text}
              >
                <Text>{subLink.text}</Text>
              </SubLink>
            ))}
          </SubMenu>
        </div>
      ))}
    </>
  );
};
