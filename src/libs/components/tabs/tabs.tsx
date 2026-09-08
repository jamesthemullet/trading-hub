import type { ReactElement } from 'react';

import Image from 'next/image';

import { Button } from '../button/button';
import { Typography } from '../typography/typography';
import styles from './tabs.module.css';

type Props = {
  currentTab: number;
  onTabChange: (ind: number) => void;
  tabs: { title: string; count?: number; icons?: string[] }[];
};

export const Tabs = ({
  tabs,
  onTabChange,
  currentTab,
}: Props): ReactElement => {
  return (
    <div className={styles.tabsContainerWrapper}>
      <div className={styles.tabsWrapper} data-tabs={tabs.length}>
        {tabs.map((tab, ind) => (
          <Button
            className={styles.tabButton}
            type="button"
            appearance="plain"
            key={tab.title}
            onClick={() => currentTab !== ind && onTabChange(ind)}
            data-active={currentTab === ind}
          >
            <span className={styles.tabContent}>
              {!!tab.icons?.length && (
                <span className={styles.iconContainer}>
                  {tab.icons.map((icon) => (
                    <Image
                      key={icon}
                      src={icon}
                      width={20}
                      height={20}
                      alt=""
                    />
                  ))}
                </span>
              )}
              <Typography
                align="center"
                as="span"
                isStrong={currentTab === ind}
              >
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
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};
