import { useAtomValue } from 'jotai';
import { currentDaoLoadingAtom } from 'store/dao';

import { Bounties } from 'components/Bounties';

import styles from 'styles/pages/treasury.module.scss';

export default function Treasury() {
  const currentDaoLoading = useAtomValue(currentDaoLoadingAtom);

  if (currentDaoLoading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <div className={styles.container}>
      <Bounties />
    </div>
  );
}
