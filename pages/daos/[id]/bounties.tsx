import { useEffect } from 'react';

import { useAtom, useAtomValue } from 'jotai';

import { currentDaoLoadingAtom } from 'store/dao';
import { bountiesAtom, selectedDaoBountyAtom } from 'store/bounty';
import { BountyCard } from 'components/BountyCard';
import { DaoBountyInfo } from 'components/DaoBountyInfo';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from 'styles/pages/bounties.module.scss';

export default function BountiesPage() {
  const currentDaoLoading = useAtomValue(currentDaoLoadingAtom);

  const bounties = useAtomValue(bountiesAtom);

  const [, setSelectedDaoBounty] = useAtom(selectedDaoBountyAtom);

  useEffect(() => {
    if (!bounties || !bounties.length) {
      return;
    }

    setSelectedDaoBounty(bounties[0].id);
  }, [bounties, setSelectedDaoBounty]);

  if (currentDaoLoading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {bounties && bounties.length > 0 ? (
          bounties.map((bounty) => (
            <BountyCard
              key={`${bounty.__typename}-${bounty.id}`}
              bounty={bounty}
            />
          ))
        ) : (
          <Card className={styles['empty-card']}>
            <Typography variant="caption2" className={styles.caption}>
              You don&apos;t have any bounties yet
            </Typography>
          </Card>
        )}
      </div>
      <DaoBountyInfo />
    </div>
  );
}
