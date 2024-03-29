import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';
import { apiAtom, keyringAtom } from 'store/api';
import {
  approveOriginAtom,
  bountyPeriodsAtom,
  communityInfoAtom,
  governanceAtom,
  proposalPeriodsAtom,
  linksAtom,
  membersAtom,
  proposedDaoIdAtom,
  socialsAtom,
  tokenAtom
} from 'store/createDao';

import { TokenType } from 'constants/token';
import { GovernanceEth, GovernanceFungibleToken } from 'constants/governance';
import { stringToHex } from '@polkadot/util';
import { isEthereumAddress } from '@polkadot/util-crypto';
import { ssToEvmAddress } from 'utils/ssToEvmAddress';
import { keyringAddExternal } from 'utils/keyringAddExternal';
import { extractError } from 'utils/errors';

import { useDaoContract } from 'hooks/useDaoContract';
import { useImageUpload } from 'hooks/useImageUpload';

import type { u32 } from '@polkadot/types';
import type { CreateDaoInput, TxFailedCallback } from 'types';

import { TxButton } from 'components/TxButton';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { Notification } from 'components/ui-kit/Notifications';

type CreateDaoButtonProps = {
  disabled: boolean;
  handleNextStep: () => void;
};

export function CreateDaoButton({
  handleNextStep,
  disabled
}: CreateDaoButtonProps) {
  const [nextDaoId, setNextDaoId] = useState<number>(0);

  const api = useAtomValue(apiAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);
  const metamaskAccount = useAtomValue(metamaskAccountAtom);
  const keyring = useAtomValue(keyringAtom);
  const accounts = useAtomValue(accountsAtom);

  const token = useAtomValue(tokenAtom);
  const governance = useAtomValue(governanceAtom);
  const approveOrigin = useAtomValue(approveOriginAtom);
  const communityInfo = useAtomValue(communityInfoAtom);
  const members = useAtomValue(membersAtom);
  const proposalPeriods = useAtomValue(proposalPeriodsAtom);
  const bountyPeriods = useAtomValue(bountyPeriodsAtom);
  const links = useAtomValue(linksAtom);
  const socials = useAtomValue(socialsAtom);
  const setProposedDaoId = useSetAtom(proposedDaoIdAtom);

  const daoContract = useDaoContract();
  const imageUpload = useImageUpload();

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
  }, [api, nextDaoId]);

  const handleTransform = async () => {
    if (
      nextDaoId === null ||
      !keyring ||
      !proposalPeriods.proposalPeriod ||
      !bountyPeriods.spendPeriod ||
      !bountyPeriods.awardDelayPeriod ||
      !bountyPeriods.updatePeriod ||
      (governance.includes(GovernanceFungibleToken.GovernanceV1) &&
        (!proposalPeriods.enactmentPeriod ||
          !proposalPeriods.launchPeriod ||
          !proposalPeriods.votingPeriod ||
          !proposalPeriods.voteLockingPeriod))
    ) {
      return [];
    }

    const initial_balance = token.quantity;
    const token_id = nextDaoId;
    const proportion = approveOrigin.split('/').map((x) => parseInt(x, 10));
    const proposal_period = proposalPeriods.proposalPeriod;
    const spend_period = bountyPeriods.spendPeriod;
    const enactment_period = proposalPeriods.enactmentPeriod;
    const launch_period = proposalPeriods.launchPeriod;
    const voting_period = proposalPeriods.votingPeriod;
    const vote_locking_period = proposalPeriods.voteLockingPeriod;
    const cooloff_period = proposalPeriods.enactmentPeriod;
    const bounty_payout_delay = bountyPeriods.awardDelayPeriod;
    const bounty_update_period = bountyPeriods.updatePeriod;

    const assetUrl =
      communityInfo.asset && (await imageUpload(communityInfo.asset));
    const tokenAssetUrl = token.asset && (await imageUpload(token.asset));

    const metadata = stringToHex(
      JSON.stringify({
        metadata: communityInfo.metadata.trim(),
        logo: assetUrl?.replaceAll('"', ''),
        token_logo: tokenAssetUrl?.replaceAll('"', ''),
        links: links.filter((x) => x.length > 0),
        socials: socials.filter((x) => x.length > 0)
      })
    );

    const data: CreateDaoInput = {
      name: communityInfo.name.trim(),
      purpose: communityInfo.purpose.trim(),
      metadata,
      policy: {
        proposal_period,
        bounty_payout_delay,
        bounty_update_period,
        spend_period,
        approve_origin: { type: 'AtLeast', proportion }
      }
    };

    switch (token.type) {
      case TokenType.ETH_TOKEN: {
        if (governance.includes(GovernanceEth.OwnershipWeightedVoting)) {
          data.policy.governance = 'OwnershipWeightedVoting';
        }
        data.token_address = token.address;
        break;
      }
      case TokenType.FUNGIBLE_TOKEN: {
        if (
          governance.includes(GovernanceFungibleToken.GovernanceV1) &&
          enactment_period &&
          launch_period &&
          voting_period &&
          vote_locking_period &&
          cooloff_period
        ) {
          data.policy.governance = {
            GovernanceV1: {
              enactment_period,
              launch_period,
              voting_period,
              vote_locking_period,
              fast_track_voting_period: 30,
              cooloff_period,
              minimum_deposit: 1
            }
          };
        }
        data.token = {
          token_id,
          initial_balance,
          metadata: {
            name: token.name.trim(),
            symbol: token.ticker.trim(),
            decimals: token.decimals
          }
        };
        break;
      }
      default: {
        // eslint-disable-next-line no-console
        console.error(`Token type ${token.type} does not exist`);
      }
    }

    const _members = members
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

  const onFailed: TxFailedCallback = (result) => {
    toast.error(
      <Notification
        title="Transaction declined"
        body={extractError(api, result)}
        variant="error"
      />
    );
  };

  const onSuccess = () => {
    setProposedDaoId(nextDaoId);
    toast.success(
      <Notification
        title="Transaction created"
        body="Community will be created soon."
        variant="success"
      />
    );
    handleNextStep();
  };

  const handleDaoEthereum = async () => {
    if (!daoContract || !metamaskAccount) {
      return;
    }

    const data = await handleTransform();

    try {
      await daoContract
        .connect(metamaskAccount)
        .createDao(...data, { gasLimit: 3000000 });

      onSuccess();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);

      onFailed(null);
    }
  };

  return substrateAccount ? (
    <TxButton
      onSuccess={onSuccess}
      onFailed={(result) => onFailed(result)}
      disabled={disabled}
      accountId={substrateAccount?.address}
      params={handleTransform}
      tx={api?.tx.dao.createDao}
    >
      Create Community
      <Icon name="tick" size="xs" />
    </TxButton>
  ) : (
    <Button onClick={handleDaoEthereum} disabled={disabled}>
      Create Community
      <Icon name="tick" size="xs" />
    </Button>
  );
}
