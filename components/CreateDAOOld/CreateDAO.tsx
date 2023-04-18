import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-toastify';

import { useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';

import { useDaoContract } from 'hooks/useDaoContract';
import { ssToEvmAddress } from 'utils/ssToEvmAddress';
import { keyringAddExternal } from 'utils/keyringAddExternal';
import { convertTimeToBlock } from 'utils/convertTimeToBlock';

import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { stringToHex } from '@polkadot/util';

import type { Option, u32 } from '@polkadot/types';
import type { CreateDaoInput, DaoCodec, TxFailedCallback } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Notification } from 'components/ui-kit/Notifications';
import { TxButton } from 'components/TxButton';
import {
  DaoBasicState,
  DaoBountyState,
  DaoGovernanceState,
  DaoInfoState,
  DaoMembersState,
  DaoTokenState,
  ProposalPeriod,
  TokenType
} from './types';
import { DaoInfo } from './DaoInfo';
import { DaoMembers } from './DaoMembers';
import { DaoToken } from './DaoToken';
import { DaoGovernance } from './DaoGovernance';

import { DaoBounty } from './DaoBounty';
import { DaoBasic } from './DaoBasic';
import styles from './CreateDAO.module.scss';

const initialDaoInfoState: DaoInfoState = {
  name: '',
  purpose: ''
};

const initialDaoTokenState: DaoTokenState = {
  name: '',
  type: TokenType.FUNGIBLE_TOKEN,
  quantity: '',
  address: '',
  symbol: '',
  decimals: 2
};

const initialDaoGovernanceState: DaoGovernanceState = {
  enactmentPeriod: '',
  launchPeriod: '',
  voteLockingPeriod: '',
  votingPeriod: '',
  enactmentPeriodType: ProposalPeriod.DAYS,
  launchPeriodType: ProposalPeriod.DAYS,
  voteLockingPeriodType: ProposalPeriod.DAYS,
  votingPeriodType: ProposalPeriod.DAYS
};

const initialDaoMembersState: DaoMembersState = {
  role: 'Council',
  addresses: ['']
};

const initialDaoBountyState: DaoBountyState = {
  updatePeriod: '',
  awardDelayPeriod: '',
  updatePeriodType: ProposalPeriod.DAYS,
  awardDelayPeriodType: ProposalPeriod.DAYS
};

const initialDaoBasicState: DaoBasicState = {
  approveOrigin: '1/2',
  proposalPeriod: '',
  spendPeriod: '',
  proposalPeriodType: ProposalPeriod.DAYS,
  spendPeriodType: ProposalPeriod.DAYS
};

export function CreateDAO() {
  const router = useRouter();
  const [nextDaoId, setNextDaoId] = useState<number>(0);
  const [daoInfo, setDaoInfo] = useState<DaoInfoState>(initialDaoInfoState);
  const [daoToken, setDaoToken] = useState<DaoTokenState>(initialDaoTokenState);
  const [daoGovernance, setDaoGovernance] = useState<DaoGovernanceState>(
    initialDaoGovernanceState
  );
  const [daoMembers, setDaoMembers] = useState<DaoMembersState>(
    initialDaoMembersState
  );
  const [daoBounty, setDaoBounty] = useState<DaoBountyState>(
    initialDaoBountyState
  );
  const [daoBasic, setDaoBasic] = useState<DaoBasicState>(initialDaoBasicState);
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);
  const accounts = useAtomValue(accountsAtom);
  const metamaskSigner = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const [proposedDaoId, setProposedDaoId] = useState<number | null>(null);
  const daoCreatedRef = useRef<boolean>(false);

  const daoContract = useDaoContract();

  useEffect(() => {
    if (proposedDaoId === null) {
      return undefined;
    }

    let unsubscribe: any;

    api?.query.dao
      .daos<Option<DaoCodec>>(
        proposedDaoId,
        async (_proposedDao: Option<DaoCodec>) => {
          if (_proposedDao.isEmpty) {
            return;
          }

          const founder = _proposedDao.value.founder.toString();
          const address = metamaskSigner
            ? await metamaskSigner?.getAddress()
            : substrateAccount?.address;

          if (!address) {
            return;
          }

          const substrateAddress = metamaskSigner
            ? evmToAddress(address)
            : address;
          if (founder !== substrateAddress || !daoCreatedRef.current) {
            return;
          }

          router.push({
            pathname: '/create-dao/pending',
            query: { 'created-dao-id': proposedDaoId }
          });
        }
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [
    api?.query.dao,
    metamaskSigner,
    proposedDaoId,
    router,
    substrateAccount?.address
  ]);

  useEffect(() => {
    let unsubscribe: any;

    api?.query.dao
      .nextDaoId<u32>((_nextDaoId: u32) => setNextDaoId(_nextDaoId.toNumber()))
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [api, metamaskSigner, nextDaoId]);

  const handleTransform = () => {
    if (nextDaoId === null || !keyring) {
      return [];
    }

    const initial_balance = daoToken.quantity;
    const token_id = nextDaoId;
    const proportion = daoBasic.approveOrigin
      .split('/')
      .map((x) => parseInt(x, 10));
    const proposal_period = convertTimeToBlock(
      daoBasic.proposalPeriod,
      daoBasic.proposalPeriodType
    );
    const spend_period = convertTimeToBlock(
      daoBasic.spendPeriod,
      daoBasic.spendPeriodType
    );
    const enactment_period = convertTimeToBlock(
      daoGovernance.enactmentPeriod,
      daoGovernance.enactmentPeriodType
    );
    const launch_period = convertTimeToBlock(
      daoGovernance.launchPeriod,
      daoGovernance.launchPeriodType
    );
    const voting_period = convertTimeToBlock(
      daoGovernance.votingPeriod,
      daoGovernance.votingPeriodType
    );
    const vote_locking_period = convertTimeToBlock(
      daoGovernance.voteLockingPeriod,
      daoGovernance.voteLockingPeriodType
    );
    const cooloff_period = convertTimeToBlock(
      daoGovernance.enactmentPeriod,
      daoGovernance.enactmentPeriodType
    );
    const bounty_payout_delay = convertTimeToBlock(
      daoBounty.awardDelayPeriod,
      daoBounty.awardDelayPeriodType
    );
    const bounty_update_period = convertTimeToBlock(
      daoBounty.updatePeriod,
      daoBounty.updatePeriodType
    );

    const data: CreateDaoInput = {
      name: daoInfo.name.trim(),
      purpose: daoInfo.purpose.trim(),
      metadata: 'metadata',
      policy: {
        proposal_period,
        bounty_payout_delay,
        bounty_update_period,
        spend_period,
        approve_origin: { type: 'AtLeast', proportion },
        governance:
          daoToken.type === 'Fungible Token'
            ? {
                GovernanceV1: {
                  enactment_period,
                  launch_period,
                  voting_period,
                  vote_locking_period,
                  fast_track_voting_period: 30,
                  cooloff_period,
                  minimum_deposit: 1
                }
              }
            : 'OwnershipWeightedVoting'
      }
    };

    switch (daoToken.type) {
      case TokenType.ETH_TOKEN: {
        data.token_address = daoToken.address;
        break;
      }
      case TokenType.FUNGIBLE_TOKEN: {
        data.token = {
          token_id,
          initial_balance,
          metadata: {
            name: daoToken.name.trim(),
            symbol: daoToken.symbol.trim(),
            decimals: daoToken.decimals
          }
        };
        break;
      }
      default: {
        // eslint-disable-next-line no-console
        console.error(`Token type ${daoToken.type} does not exist`);
      }
    }

    const _members = daoMembers.addresses
      .filter((_address) => _address.length > 0)
      .map((_address) => {
        const _foundAccount = accounts?.find(
          (_account) => _account.address === _address
        );

        if (_foundAccount) {
          if (_foundAccount.meta.isEthereum) {
            return _foundAccount.meta.ethAddress;
          }
        }

        // TODO: re-work this
        if (
          _foundAccount?.type === 'sr25519' ||
          _foundAccount?.type === 'ed25519'
        ) {
          return _address;
        }

        if (isEthereumAddress(_address)) {
          keyringAddExternal(keyring, _address);
          return _address.trim();
        }

        return ssToEvmAddress(_address);
      });

    return [_members, [], stringToHex(JSON.stringify(data).trim())];
  };

  const handleDaoEthereum = async () => {
    if (!daoContract || !metamaskSigner) {
      return;
    }

    const data = handleTransform();

    try {
      await daoContract
        .connect(metamaskSigner)
        .createDao(...data, { gasLimit: 3000000 });
      daoCreatedRef.current = true;
      setProposedDaoId(nextDaoId);
      toast.success(
        <Notification
          title="Transaction created"
          body="Community will be created soon."
          variant="success"
        />
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      toast.error(
        <Notification
          title="Transaction declined"
          body="Transaction was declined."
          variant="error"
        />
      );
    }
  };

  const onFailed: TxFailedCallback = () => {
    toast.error(
      <Notification
        title="Transaction declined"
        body="Transaction was declined"
        variant="error"
      />
    );
  };

  const handleOnSuccess = async () => {
    daoCreatedRef.current = true;
    setProposedDaoId(nextDaoId);
    toast.success(
      <Notification
        title="Transaction created"
        body="Community will be created soon."
        variant="success"
      />
    );
  };

  const democracyComplete =
    daoToken.type === 'Fungible Token'
      ? daoGovernance.votingPeriodType &&
        daoGovernance.votingPeriodType &&
        daoGovernance.voteLockingPeriod &&
        daoGovernance.voteLockingPeriodType &&
        daoGovernance.enactmentPeriod &&
        daoGovernance.enactmentPeriodType &&
        daoGovernance.launchPeriod &&
        daoGovernance.launchPeriodType
      : true;

  const disabled =
    !daoInfo.name ||
    !daoInfo.purpose ||
    (daoToken.type === TokenType.FUNGIBLE_TOKEN &&
      (!daoToken.name || !daoToken.symbol)) ||
    (daoToken.type === TokenType.ETH_TOKEN && !daoToken.address) ||
    !daoMembers.role ||
    !daoBasic.approveOrigin ||
    !daoBasic.proposalPeriod ||
    !daoBasic.proposalPeriodType ||
    !daoBasic.spendPeriod ||
    !daoBasic.spendPeriodType ||
    !democracyComplete ||
    !daoBounty.awardDelayPeriod ||
    !daoBounty.awardDelayPeriodType ||
    !daoBounty.updatePeriod ||
    !daoBounty.updatePeriodType;

  return (
    <div className={styles.container}>
      <Link href="/" className={styles['cancel-button']}>
        <Button variant="outlined" color="destructive" size="sm">
          Cancel creation
        </Button>
      </Link>

      <div className={styles.content}>
        <Typography variant="h1" className={styles.title}>
          Create A Tokenized Community
        </Typography>

        <DaoInfo state={daoInfo} setState={setDaoInfo} />
        <DaoMembers state={daoMembers} setState={setDaoMembers} />

        <DaoToken state={daoToken} setState={setDaoToken} />

        <DaoBasic state={daoBasic} setState={setDaoBasic} />
        {daoToken.type === 'Fungible Token' && (
          <DaoGovernance state={daoGovernance} setState={setDaoGovernance} />
        )}
        <DaoBounty state={daoBounty} setState={setDaoBounty} />

        <div className={styles['create-proposal']}>
          {substrateAccount ? (
            <TxButton
              onSuccess={handleOnSuccess}
              onFailed={onFailed}
              disabled={disabled}
              accountId={substrateAccount?.address}
              params={handleTransform}
              tx={api?.tx.dao.createDao}
              className={styles['create-button']}
            >
              Create
            </TxButton>
          ) : (
            <Button
              onClick={handleDaoEthereum}
              disabled={disabled}
              className={styles['create-button']}
            >
              Create
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
