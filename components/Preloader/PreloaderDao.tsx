import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSetAtom } from 'jotai';
import { currentDaoAtom, currentDaoLoadingAtom } from 'store/dao';
import { useSubscription } from '@apollo/client';
import SUBSCRIBE_DAO_BY_ID from 'query/subscribeDaoById.graphql';

import type { SubscribeDaoById } from 'types';

export function PreloaderDao() {
  const router = useRouter();
  const setCurrentDao = useSetAtom(currentDaoAtom);
  const setCurrentDaoLoading = useSetAtom(currentDaoLoadingAtom);
  const { data, loading } = useSubscription<SubscribeDaoById>(
    SUBSCRIBE_DAO_BY_ID,
    {
      variables: { id: router.query.id }
    }
  );

  useEffect(() => {
    if (router.query.id && typeof router.query.id !== 'string') {
      router.push('/404');
      return;
    }
    if (loading) {
      return;
    }
    if (!data || !data.daoById) {
      router.push('/404');
    }
  }, [data, loading, router]);

  useEffect(() => {
    setCurrentDaoLoading(loading);
  }, [loading, setCurrentDaoLoading]);

  useEffect(() => {
    if (!data || !data.daoById) {
      return;
    }

    setCurrentDao(data.daoById);
  }, [data, setCurrentDao]);

  return null;
}
