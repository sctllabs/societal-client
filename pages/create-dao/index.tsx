import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAtomValue } from 'jotai';
import { currentAccountAtom } from 'store/account';

import { CreateDAO } from 'components/CreateDAO';

export default function CreateDAOPage() {
  const router = useRouter();
  const currentAccount = useAtomValue(currentAccountAtom);

  useEffect(() => {
    if (!currentAccount) {
      router.push('/');
    }
  }, [currentAccount, router]);

  return <CreateDAO />;
}
