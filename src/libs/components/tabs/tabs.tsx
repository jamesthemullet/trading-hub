import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

type Props = {
  currentTab: number;
  onTabChange: (ind: number) => void;
  tabs: { title: string; count?: number }[];
};

const TabsContainerWrapper = styled.div`
  margin-left: 8px;
  margin-right: 8px;
`;

const TabsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 450px;
  margin-top: ${spacing(1)};
`;

const TabButton = styled.button<{ isActive: boolean }>`
  border: none;
  max-width: 50%;
  width: 100%;
  padding-bottom: 0;
  background: none;
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 400)};
  font-size: 16px;

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 3px;
    border-radius: 3px;
    margin-top: 12px;
    background-color: ${({ isActive }) =>
      isActive ? `${color.accent.primary.primary}` : 'none'};
  }
`;

const Count = styled.span`
  background: ${color.improvedFit};
  margin-left: ${spacing(1)};
  border-radius: 100px;
  padding: 2px 6px;
  font-weight: normal;
  display: inline;
  font-size: 11px;
`;

export const Tabs = ({ tabs, onTabChange, currentTab }: Props) => {
  return (
    <TabsContainerWrapper>
      <TabsWrapper>
        {tabs.map((tab, ind) => (
          <TabButton
            key={tab.title}
            onClick={() => currentTab !== ind && onTabChange(ind)}
            isActive={currentTab === ind}
          >
            {tab.title}

            {!!tab.count && <Count>{tab.count}</Count>}
          </TabButton>
        ))}
      </TabsWrapper>
    </TabsContainerWrapper>
  );
};
