import { useRouter } from 'next/router';

import { useAtomValue } from 'jotai';
import { currentDaoAtom } from 'store/dao';

import { generateRandomGradient } from 'utils/generateRandomGradient';
import { formLinkByDaoId } from 'utils/formLinkByDaoId';

import type { Href } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Icon, IconNamesType } from 'components/ui-kit/Icon';
import { Avatar } from 'components/ui-kit/Avatar';
import { Button } from 'components/ui-kit/Button';
import { NavLink } from 'components/ui-kit/NavLink';

import styles from './Subheader.module.scss';
import { CreateProposal } from '../CreateProposal';

type Navigation = {
  icon: IconNamesType;
  title: string;
  href: Href;
};

const navigations: Navigation[] = [
  {
    icon: 'dashboard',
    title: 'Dashboard',
    href: 'dashboard'
  },
  {
    icon: 'governance',
    title: 'Governance',
    href: 'governance'
  }
];

export function Subheader() {
  const router = useRouter();
  const { id: daoId } = router.query;
  const currentDao = useAtomValue(currentDaoAtom);

  if (!daoId || !currentDao) {
    return null;
  }

  const handleOnClick = () => {
    navigator.clipboard.writeText(currentDao.account.id);
  };

  const [angle, color1, color2, color3] = generateRandomGradient(
    currentDao.name
  );

  return (
    <div className={styles.root}>
      <div
        style={{
          background: `linear-gradient(${angle}, ${color1}, ${color2}, ${color3})`
        }}
        className={styles['top-container']}
      />
      <div className={styles['bottom-container']}>
        <div className={styles['left-container']}>
          <span className={styles['logo-container']}>
            <Avatar
              className={styles.logo}
              value={currentDao.name}
              radius="standard"
            />
          </span>
          <div className={styles['title-container']}>
            <Typography variant="title2">{currentDao.name}</Typography>
            <Typography variant="caption2">
              {currentDao.council.length}{' '}
              {currentDao.council.length > 1 ? 'members' : 'member'}
            </Typography>
            <span className={styles['address-container']}>
              <Typography variant="caption3">
                {currentDao.account.id}
              </Typography>
              <Button variant="icon" size="xs" onClick={handleOnClick}>
                <Icon name="copy" size="xs" />
              </Button>
            </span>
          </div>
        </div>
        <div className={styles['center-container']}>
          {navigations.map((_navigation) => (
            <NavLink
              key={_navigation.href}
              href={formLinkByDaoId(currentDao.id, _navigation.href)}
              active={router.pathname.includes(_navigation.href)}
              icon={_navigation.icon}
              title={_navigation.title}
            />
          ))}
        </div>
        <div className={styles['right-container']}>
          {router.pathname.includes('create-proposal') ? null : (
            <CreateProposal daoId={daoId as string} />
          )}
        </div>
      </div>
    </div>
  );
}
