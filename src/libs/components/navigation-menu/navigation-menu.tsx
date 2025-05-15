import styled from '@emotion/styled';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const navigationLightGreen = '#216d58';

const MenuItem = styled.div`
  width: 100%;
`;

const StyledLink = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<{ isActive: boolean }>`
  text-decoration: none;
  font-size: 12px;
  color: #fff;
  border: none;
  background-color: ${({ isActive }) =>
    isActive ? navigationLightGreen : color.darkHeritageGreen};
  display: flex;
  min-height: 64px;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 11;
  flex-direction: column;
  padding: ${spacing(1)};
  width: 100%;

  p {
    color: #fff;
  }

  &:hover,
  &:focus {
    background-color: ${navigationLightGreen};
    outline: none;
  }
`;

const Icon = styled.img``;

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

export const NavigationMenu = ({ menuItems }: MenuItems) => {
  const pathname = usePathname();

  return (
    <>
      {menuItems.map((menuItem) => {
        const isActive = menuItem.pathExcludes
          ? pathname.includes(menuItem.path) &&
            !pathname.includes(menuItem.pathExcludes)
          : pathname.includes(menuItem.path);

        return (
          <MenuItem key={menuItem.title}>
            <StyledLink
              isActive={isActive}
              title={menuItem.title}
              aria-label={menuItem.title}
              href={menuItem.path}
            >
              {isActive ? (
                <Icon
                  src={menuItem.activeIcon}
                  alt={menuItem.alt}
                  height={25}
                  width={25}
                />
              ) : (
                <Icon
                  src={menuItem.icon}
                  alt={menuItem.alt}
                  height={25}
                  width={25}
                />
              )}
              <Text>{menuItem.shortTitle}</Text>
            </StyledLink>
          </MenuItem>
        );
      })}
    </>
  );
};
