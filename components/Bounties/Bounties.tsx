import { useEffect, useState } from 'react';

import { useAtom, useAtomValue } from 'jotai';
import { bountiesAtom, selectedDaoBountyAtom } from 'store/bounty';

import { Tabs, TabsList, TabsTrigger } from 'components/ui-kit/Tabs';
import { Typography } from 'components/ui-kit/Typography';
import { BountyCard } from 'components/BountyCard';
import { Card } from 'components/ui-kit/Card';
import { DaoBountyInfo } from 'components/DaoBountyInfo';

import styles from './Bounties.module.scss';

type TabOption = 'Bounties';
const tabOptions: TabOption[] = ['Bounties'];

export function Bounties() {
  const [tab, setTab] = useState<TabOption>('Bounties');
  const bounties = useAtomValue(bountiesAtom);

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  const [, setSelectedDaoBounty] = useAtom(selectedDaoBountyAtom);

  useEffect(() => {
    if (!bounties || !bounties.length) {
      return;
    }

    setSelectedDaoBounty(bounties[0].id);
  }, [bounties, setSelectedDaoBounty]);

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

      <div className={styles.content}>
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
                You don&apos;t have any bounties yet
              </Typography>
            </Card>
          )}
        </div>
        <DaoBountyInfo />
      </div>
    </div>
  );
}
