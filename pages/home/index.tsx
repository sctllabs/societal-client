import { useEffect, useState } from 'react';

import { useSetAtom } from 'jotai';
import { curatorBountiesAtom, selectedCuratorBountyAtom } from 'store/bounty';

import { Tabs, TabsList, TabsTrigger } from 'components/ui-kit/Tabs';
import { Typography } from 'components/ui-kit/Typography';
import { CuratorBounties } from 'components/CuratorBounties';
import { CuratorBountiesInfo } from 'components/CuratorBountiesInfo';
import { CuratorBountyInfo } from 'components/CuratorBountyInfo';

import styles from 'styles/pages/home.module.scss';

type TabOption = 'Your Task Board' | 'Proposal Calendar';
const tabOptions: TabOption[] = ['Your Task Board', 'Proposal Calendar'];

export default function HomePage() {
  const [tab, setTab] = useState<TabOption>('Your Task Board');
  const setCuratorBounties = useSetAtom(curatorBountiesAtom);
  const setSelectedCuratorBounty = useSetAtom(selectedCuratorBountyAtom);

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  useEffect(
    () => () => {
      setCuratorBounties(null);
      setSelectedCuratorBounty(null);
    },
    [setCuratorBounties, setSelectedCuratorBounty]
  );

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles['left-container']}>
          <div className={styles['tabs-container']}>
            <Tabs
              value={tab}
              onValueChange={onTabValueChange}
              className={styles.tabs}
            >
              <TabsList>
                {tabOptions.map((tabOption) => (
                  <TabsTrigger value={tabOption} key={tabOption} asChild>
                    <Typography variant="title2">{tabOption}</Typography>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <CuratorBounties />
        </div>
        <CuratorBountiesInfo />
        <CuratorBountyInfo />
      </div>
    </div>
  );
}
