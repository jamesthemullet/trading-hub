import { Button } from '../button/button';
import { Typography } from '../typography/typography';
import styles from './tabs.module.css';

type Props = {
  currentTab: number;
  onTabChange: (ind: number) => void;
  tabs: { title: string; count?: number }[];
};

export const Tabs = ({ tabs, onTabChange, currentTab }: Props) => {
  return (
    <div className={styles.tabsContainerWrapper}>
      <div className={styles.tabsWrapper}>
        {tabs.map((tab, ind) => (
          <Button
            className={styles.tabButton}
            type="button"
            appearance="plain"
            key={tab.title}
            onClick={() => currentTab !== ind && onTabChange(ind)}
            data-active={currentTab === ind}
          >
            <Typography align="center" as="span" isStrong={currentTab === ind}>
              {tab.title}
              {!!tab.count && (
                <Typography
                  as="span"
                  variant="labelMedium"
                  className={styles.count}
                >
                  {tab.count}
                </Typography>
              )}
            </Typography>
          </Button>
        ))}
      </div>
    </div>
  );
};
