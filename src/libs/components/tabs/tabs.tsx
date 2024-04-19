import styled from '@emotion/styled';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

type Props = {
  currentTab: number;
  onTabChange: (ind: number) => void;
  tabs: { title: string; count?: number }[];
};

const TabsContainerWrapper = styled.div`
  border-bottom: solid 1px #b1b1b1;
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
  width: 100%;
  padding-bottom: 0;
  background: none;
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 400)};
  font-size: 16px;

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 5px;
    border-radius: 3px;
    margin-top: 12px;
    background-color: ${({ isActive }) => (isActive ? '#005640' : 'none')};
  }
`;

const Count = styled.span`
  background: ${color.improvedFit};
  color: #fff;
  margin-left: ${spacing(1)};
  border-radius: 15px;
  padding: 2px 6px;
  font-weight: normal;
  width: 27px;
  display: inline;
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
