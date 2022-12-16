import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { useAtomValue } from 'jotai';
import { currentAccountAtom } from 'store/api';
import { daosAtom } from 'store/dao';

import { CreateProposal } from 'components/CreateProposal';

export default function Proposal() {
  const router = useRouter();
  const daos = useAtomValue(daosAtom);
  const currentAccount = useAtomValue(currentAccountAtom);

  useEffect(() => {
    if (!currentAccount) {
      router.push('/');
    }
  }, [currentAccount, router]);

  const currentDao = daos?.find((x) => x.id === router.query.id);

  useEffect(() => {
    if (!daos) {
      return;
    }
    if (!currentDao) {
      router.push('/404');
    }
  }, [currentDao, daos, router]);

  const id = router.query.id as string;

  return (
    <>
      <Head>
        <title>Create Proposal</title>
      </Head>
      <CreateProposal daoId={id} />
    </>
  );
}
