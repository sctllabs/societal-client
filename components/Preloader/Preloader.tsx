import { useRouter } from 'next/router';

import { PreloaderApi } from './PreloaderApi';
import { PreloaderKeyring } from './PreloaderKeyring';
import { PreloaderCurrentBlock } from './PreloaderCurrentBlock';
import { PreloaderAccount } from './PreloaderAccount';
import { PreloaderToken } from './PreloaderToken';
import { PreloaderCurrency } from './PreloaderCurrency';
import { PreloaderDao } from './PreloaderDao';
import { PreloaderAccountBalance } from './PreloaderAccountBalance';
import { PreloaderBounties } from './PreloaderBounties';
import { PreloaderCuratorBounties } from './PreloaderCuratorBounties';

export function Preloader() {
  const router = useRouter();

  const daoIdExists = router.query.id && typeof router.query.id === 'string';
  const isHomePage = router.asPath === '/home';

  return (
    <>
      <PreloaderApi />
      <PreloaderKeyring />
      <PreloaderCurrency />
      <PreloaderCurrentBlock />
      <PreloaderAccount />
      <PreloaderAccountBalance />
      {daoIdExists && <PreloaderDao />}
      <PreloaderToken />
      {daoIdExists && <PreloaderBounties />}
      {isHomePage && <PreloaderCuratorBounties />}
    </>
  );
}
