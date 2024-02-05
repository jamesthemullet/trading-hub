import styled from '@emotion/styled';

type Props = {
  currentTab: number;
  onTabChange: (ind: number) => void;
  tabs: string[];
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
  margin-top: 30px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  border: none;
  width: 100%;
  padding-bottom: 0;
  background: none;
  /* stylelint-disable-next-line property-disallowed-list */
  font-weight: ${({ isActive }) => (isActive ? 'bold' : 400)};
  /* stylelint-disable-next-line property-disallowed-list */
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

export const Tabs = ({ tabs, onTabChange, currentTab }: Props) => {
  return (
    <TabsContainerWrapper>
      <TabsWrapper>
        {tabs.map((tab, ind) => (
          <TabButton
            key={tab}
            onClick={() => currentTab !== ind && onTabChange(ind)}
            isActive={currentTab === ind}
          >
            {tab}
          </TabButton>
        ))}
      </TabsWrapper>
    </TabsContainerWrapper>
  );
};
