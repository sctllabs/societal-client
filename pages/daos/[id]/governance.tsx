import { useAtomValue } from 'jotai';
import { currentDaoAtom, currentDaoLoadingAtom } from 'store/dao';

import { Proposals } from 'components/Proposals';
import { ReferendumInfo } from 'components/ReferendumInfo';

import styles from 'styles/pages/governance.module.scss';

export default function Governance() {
  const currentDaoLoading = useAtomValue(currentDaoLoadingAtom);
  const currentDao = useAtomValue(currentDaoAtom);

  if (currentDaoLoading) {
    // TODO @asanzyb create a loader
    return null;
  }

  return (
    <div className={styles.container}>
      <Proposals />
      {currentDao?.policy.governance.__typename === 'GovernanceV1' && (
        <ReferendumInfo />
      )}
    </div>
  );
}
