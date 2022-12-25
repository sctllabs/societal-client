import {
  useCallback,
  useEffect,
  useState,
  ChangeEventHandler,
  MouseEventHandler,
  KeyboardEventHandler,
  useRef
} from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useAtom, useAtomValue } from 'jotai';
import { apiAtom } from 'store/api';
import { createdDaoIdAtom, daosAtom } from 'store/dao';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';

import { useDaoContract } from 'hooks/useDaoContract';

import {
  blake2AsHex,
  decodeAddress,
  evmToAddress
} from '@polkadot/util-crypto';
import { isHex, stringToHex } from '@polkadot/util';

import type { u32, Option } from '@polkadot/types';
import type { DaoCodec } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Radio } from 'components/ui-kit/Radio/Radio';
import { MembersDropdown } from 'components/MembersDropdown';
import { TxButton } from 'components/TxButton';

import styles from './CreateDAO.module.scss';

enum InputName {
  DAO_NAME = 'daoName',
  PURPOSE = 'purpose',
  QUANTITY = 'quantity',
  ADDRESSES = 'addresses',
  ROLE = 'role',
  TOKEN_NAME = 'tokenName',
  TOKEN_SYMBOL = 'tokenSymbol',
  PROPOSAL_PERIOD = 'proposalPeriod',
  PROPOSAL_PERIOD_TYPE = 'proposalPeriodType'
}

enum InputLabel {
  DAO_NAME = '* DAO Name',
  PURPOSE = '* Purpose',
  QUANTITY = 'Quantity of Tokens',
  ROLE = 'Role of Members',
  ADDRESS = 'New Member',
  TOKEN_NAME = 'Token Name',
  TOKEN_SYMBOL = 'Token Symbol',
  PROPOSAL_PERIOD = 'Proposal Period'
}

enum ProposalPeriod {
  DAYS = 'Days',
  HOURS = 'Hours'
}

const PURPOSE_INPUT_MAX_LENGTH = 500;
const MILLIS_IN_HOUR = 60 * 60 * 1000;
const MILLIS_IN_DAY = 24 * 60 * 60 * 1000;

type Role = 'Council';

type State = {
  daoName: string;
  purpose: string;
  quantity: string;
  role: Role;
  addresses: string[];
  tokenName: string;
  tokenSymbol: string;
  proposalPeriod: string;
  proposalPeriodType: ProposalPeriod;
};

export function CreateDAO() {
  const router = useRouter();
  const [nextDaoId, setNextDaoId] = useState<number>(0);
  const api = useAtomValue(apiAtom);
  const daos = useAtomValue(daosAtom);
  const accounts = useAtomValue(accountsAtom);
  const metamaskSigner = useAtomValue(metamaskAccountAtom);
  const substrateAccount = useAtomValue(substrateAccountAtom);

  const [createdDaoId, setCreatedDaoId] = useAtom(createdDaoIdAtom);
  const [proposedDaoId, setProposedDaoId] = useState<number | null>(null);
  const daoCreatedRef = useRef<boolean>(false);

  const daoContract = useDaoContract();

  const [state, setState] = useState<State>({
    daoName: '',
    purpose: '',
    quantity: '',
    role: 'Council',
    addresses: [''],
    tokenName: '',
    tokenSymbol: '',
    proposalPeriod: '',
    proposalPeriodType: ProposalPeriod.DAYS
  });

  useEffect(() => {
    if (!daoCreatedRef.current || createdDaoId === null) {
      return;
    }

    const currentDao = daos?.find((x) => parseInt(x.id, 10) === createdDaoId);
    if (!currentDao) {
      return;
    }

    router.push(`/daos/${currentDao.id}`);
  }, [createdDaoId, daos, router]);

  useEffect(() => {
    if (proposedDaoId === null) {
      return undefined;
    }

    let unsubscribe: any | null = null;
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

          setCreatedDaoId(proposedDaoId);
        }
      )
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    api?.query.dao,
    metamaskSigner,
    proposedDaoId,
    setCreatedDaoId,
    substrateAccount?.address
  ]);

  useEffect(() => {
    let unsubscribe: any | null = null;

    api?.query.dao
      .nextDaoId<u32>((_nextDaoId: u32) => setNextDaoId(_nextDaoId.toNumber()))
      .then((unsub) => {
        unsubscribe = unsub;
      })
      // eslint-disable-next-line no-console
      .catch(console.error);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api, metamaskSigner, nextDaoId]);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;

    if (targetName === InputName.ADDRESSES) {
      const dataAddressIndex = target.getAttribute('data-address-index');
      setState((prevState) => ({
        ...prevState,
        addresses: prevState.addresses.map((x, index) =>
          dataAddressIndex && parseInt(dataAddressIndex, 10) === index
            ? targetValue
            : x
        )
      }));
      return;
    }

    setState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.QUANTITY ||
        targetName === InputName.PROPOSAL_PERIOD
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  const handleAddAddressClick: MouseEventHandler = () => {
    setState((prevState) => ({
      ...prevState,
      addresses: [...prevState.addresses, '']
    }));
  };

  const handleRemoveAddressClick: MouseEventHandler = (e) => {
    const target = e.target as HTMLButtonElement;
    const dataAddressIndex = target.getAttribute('data-address-index');
    if (!dataAddressIndex) {
      return;
    }

    const addressIndex = parseInt(dataAddressIndex, 10);
    setState((prevState) => ({
      ...prevState,
      addresses:
        prevState.addresses.length === 1
          ? ['']
          : prevState.addresses.filter((_, index) => index !== addressIndex)
    }));
  };

  const disabled =
    !state.daoName ||
    !state.purpose ||
    !state.tokenName ||
    !state.role ||
    !state.tokenSymbol ||
    !state.proposalPeriod ||
    !state.proposalPeriodType;

  const handleTransform = () => {
    if (nextDaoId === null) {
      return [];
    }

    const {
      daoName,
      purpose,
      proposalPeriod,
      proposalPeriodType,
      tokenName,
      tokenSymbol,
      addresses,
      quantity
    } = state;

    const proposal_period =
      parseInt(proposalPeriod, 10) *
      (proposalPeriodType === ProposalPeriod.HOURS
        ? MILLIS_IN_HOUR
        : MILLIS_IN_DAY);

    const min_balance = quantity;
    const token_id = nextDaoId;

    const data = {
      name: daoName.trim(),
      purpose: purpose.trim(),
      metadata: 'metadata',
      policy: {
        proposal_bond: 1,
        proposal_bond_min: 1,
        proposal_period,
        approve_origin: [1, 2],
        reject_origin: [1, 2]
      },
      token: {
        token_id,
        min_balance,
        metadata: {
          name: tokenName.trim(),
          symbol: tokenSymbol.trim(),
          decimals: 10
        }
      }
    };

    return [
      addresses
        .filter((_address) => _address.length > 0)
        .map((_address) =>
          substrateAccount || isHex(_address)
            ? _address.trim()
            : `0x${blake2AsHex(decodeAddress(_address), 256).substring(26)}`
        ),
      stringToHex(JSON.stringify(data).trim())
    ];
  };

  const handleMemberChoose = (target: HTMLUListElement) => {
    const selectedWalletAddress = target.getAttribute('data-address');
    const selectedIndex = target.getAttribute('data-index');
    if (!selectedWalletAddress || selectedIndex === null) {
      return;
    }
    const addressIndex = parseInt(selectedIndex, 10);

    setState((prevState) => ({
      ...prevState,
      addresses: prevState.addresses.map((_address, index) =>
        index === addressIndex ? selectedWalletAddress : _address
      )
    }));
  };

  const handleOnClick: MouseEventHandler<HTMLUListElement> = useCallback(
    (e) => handleMemberChoose(e.target as HTMLUListElement),
    []
  );

  const handleOnKeyDown: KeyboardEventHandler<HTMLUListElement> = useCallback(
    (e) => {
      if (e.key !== ' ' && e.key !== 'Enter') {
        return;
      }
      handleMemberChoose(e.target as HTMLUListElement);
    },
    []
  );

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
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleOnSuccess = async () => {
    daoCreatedRef.current = true;
    setProposedDaoId(nextDaoId);
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles['cancel-button']}>
        <Button variant="outlined" color="destructive" size="sm">
          Cancel DAO creation
        </Button>
      </Link>

      <div className={styles.content}>
        <Typography variant="h1" className={styles.title}>
          Create DAO
        </Typography>
        <div className={styles.info}>
          <Typography variant="h3">DAO Info</Typography>
          <Input
            name={InputName.DAO_NAME}
            label={InputLabel.DAO_NAME}
            value={state.daoName}
            onChange={onInputChange}
            required
          />
          <Input
            name={InputName.PURPOSE}
            label={InputLabel.PURPOSE}
            onChange={onInputChange}
            value={state.purpose}
            maxLength={PURPOSE_INPUT_MAX_LENGTH}
            hint={
              <Typography variant="caption3">
                {state.purpose.length}/500
              </Typography>
            }
            hintPosition="end"
            required
          />
        </div>
        <div className={styles.members}>
          <Typography variant="h3">Members</Typography>
          <Typography variant="body1">
            Your Governance Solution comes with the following groups.
          </Typography>
          <div className={styles['members-inputs']}>
            <Input
              readOnly
              name={InputName.ROLE}
              label={InputLabel.ROLE}
              value={state.role}
              classNames={{
                root: styles['members-inputs-role-root'],
                input: styles['members-inputs-role-input']
              }}
              disabled
              required
            />

            <div className={styles['members-addresses']}>
              {state.addresses.map((x, index) => {
                const lastItem =
                  index === state.addresses.length - 1 &&
                  accounts?.length !== state.addresses.length;
                const key = `address-${index}`;

                return (
                  <MembersDropdown
                    accounts={accounts?.filter(
                      (_account) => !state.addresses.includes(_account.address)
                    )}
                    key={key}
                    handleOnClick={handleOnClick}
                    handleOnKeyDown={handleOnKeyDown}
                    index={index}
                  >
                    <Input
                      name={InputName.ADDRESSES}
                      label={InputLabel.ADDRESS}
                      onChange={onInputChange}
                      data-address-index={index}
                      value={
                        (accounts?.find(
                          (_account) =>
                            _account.address === state.addresses[index]
                        )?.meta.name as string) || state.addresses[index]
                      }
                      required
                      endAdornment={
                        <span className={styles['members-button-group']}>
                          {(state.addresses[index] || !lastItem) && (
                            <Button
                              data-address-index={index}
                              variant="ghost"
                              className={styles['members-add-button']}
                              onClick={handleRemoveAddressClick}
                              size="sm"
                            >
                              <Icon name="close" size="sm" />
                            </Button>
                          )}
                          {lastItem && (
                            <Button
                              data-address-index={index}
                              variant="ghost"
                              className={styles['members-add-button']}
                              onClick={handleAddAddressClick}
                              size="sm"
                            >
                              <Icon name="add" size="sm" />
                            </Button>
                          )}
                        </span>
                      }
                    />
                  </MembersDropdown>
                );
              })}
            </div>
          </div>
        </div>
        <div className={styles['quantity-of-tokens']}>
          <Typography variant="h3">Select the Quantity of Tokens</Typography>
          <Typography variant="body1">
            Specify the number of tokens, the maximum amount is 1 billion.
          </Typography>

          <div className={styles['quantity-of-tokens-inputs']}>
            <Input
              name={InputName.QUANTITY}
              label={InputLabel.QUANTITY}
              value={state.quantity}
              onChange={onInputChange}
              type="tel"
              required
            />
          </div>
        </div>
        <div className={styles['token-info']}>
          <Typography variant="h3">Select Token Info</Typography>
          <Typography variant="body1">
            Choose a name and symbol for the Governance token.
          </Typography>

          <div className={styles['token-info-inputs']}>
            <Input
              name={InputName.TOKEN_NAME}
              label={InputLabel.TOKEN_NAME}
              value={state.tokenName}
              onChange={onInputChange}
              required
            />
            <Input
              name={InputName.TOKEN_SYMBOL}
              label={InputLabel.TOKEN_SYMBOL}
              value={state.tokenSymbol}
              onChange={onInputChange}
              required
            />
          </div>
        </div>
        <div className={styles['proposal-period']}>
          <Typography variant="h3">Proposal Period</Typography>
          <Typography variant="body1">
            Determine the duration of your DAO&apos;s proposals.
          </Typography>

          <div className={styles['proposal-period-input']}>
            <Input
              name={InputName.PROPOSAL_PERIOD}
              label={InputLabel.PROPOSAL_PERIOD}
              value={state.proposalPeriod}
              onChange={onInputChange}
              type="tel"
              required
              endAdornment={
                <Dropdown
                  dropdownItems={
                    <Card dropdown className={styles['dropdown-card']}>
                      <RadioGroup
                        value={state.proposalPeriodType}
                        className={styles['dropdown-radio-group']}
                        onChange={onInputChange}
                        name={InputName.PROPOSAL_PERIOD_TYPE}
                      >
                        {Object.values(ProposalPeriod).map((x) => (
                          <div
                            key={x}
                            className={styles['dropdown-content-span']}
                          >
                            <Radio label={x} value={x} />
                          </div>
                        ))}
                      </RadioGroup>
                    </Card>
                  }
                >
                  <Button
                    variant="text"
                    className={styles['proposal-period-button']}
                    size="sm"
                  >
                    <div className={styles['proposal-period-dropdown']}>
                      <Typography variant="body2">
                        {state.proposalPeriodType}
                      </Typography>
                      <Icon name="arrow-down" size="sm" />
                    </div>
                  </Button>
                </Dropdown>
              }
            />
          </div>
        </div>
        <div className={styles['create-proposal']}>
          {substrateAccount ? (
            <TxButton
              onSuccess={handleOnSuccess}
              disabled={disabled}
              accountId={substrateAccount?.address}
              params={handleTransform}
              tx={api?.tx.dao.createDao}
              className={styles['create-button']}
            >
              Create DAO
            </TxButton>
          ) : (
            <Button
              onClick={handleDaoEthereum}
              disabled={disabled}
              className={styles['create-button']}
            >
              Create DAO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// 0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b account3
// 0x7b9Dad6967d635f3c793a374015D74DfA538080C ger
// 0x4Cc5bB84F75456641aFfD3503cA25E87305ddC13 acc 1
// 0xcF22A2f92CC8ba1987657b07FAb6e41C417Dd3B7 acc 2
