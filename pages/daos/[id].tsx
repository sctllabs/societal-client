import { useRouter } from 'next/router';
import { useAtomValue } from 'jotai';
import { daosAtom } from 'store/dao';
import { currentAccountAtom } from 'store/api';
import { useEffect } from 'react';

export default function Dao() {
  const daos = useAtomValue(daosAtom);
  const currentAccount = useAtomValue(currentAccountAtom);
  const router = useRouter();

  const { id } = router.query;

  useEffect(() => {
    if (!currentAccount) {
      router.push('/');
    }
  }, [currentAccount, router]);

  return <div></div>;
}
