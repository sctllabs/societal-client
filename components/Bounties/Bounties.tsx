import { useState } from 'react';

import { useAtomValue } from 'jotai';
import { bountiesAtom } from 'store/bounty';

import { Tabs, TabsList, TabsTrigger } from 'components/ui-kit/Tabs';
import { Typography } from 'components/ui-kit/Typography';
import { BountyCard } from 'components/BountyCard';
import { Card } from 'components/ui-kit/Card';

import styles from './Bounties.module.scss';

type TabOption = 'Bounties';
const tabOptions: TabOption[] = ['Bounties'];

export function Bounties() {
  const [tab, setTab] = useState<TabOption>('Bounties');
  const bounties = useAtomValue(bountiesAtom);

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  return (
    <div className={styles.container}>
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

      <div className={styles['content-container']}>
        {bounties ? (
          bounties.map((bounty) => (
            <BountyCard
              key={`${bounty.__typename}-${bounty.id}`}
              bounty={bounty}
            />
          ))
        ) : (
          <Card className={styles['proposals-empty-card']}>
            <Typography variant="caption2" className={styles.caption}>
              You don&apos;t have any&nbsp; bounties yet
            </Typography>
          </Card>
        )}
      </div>
    </div>
  );
}
