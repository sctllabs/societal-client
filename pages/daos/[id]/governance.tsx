import { useAtomValue } from 'jotai';
import { currentDaoLoadingAtom } from 'store/dao';

import { Proposals } from 'components/Proposals';
import { ReferendumInfo } from 'components/ReferendumInfo';

import styles from 'styles/pages/governance.module.scss';

export default function DaoGovernance() {
  const currentDaoLoading = useAtomValue(currentDaoLoadingAtom);

  if (currentDaoLoading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <div className={styles.container}>
      <Proposals />
      <ReferendumInfo />
    </div>
  );
}
