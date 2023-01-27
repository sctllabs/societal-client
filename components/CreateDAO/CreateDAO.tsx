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
import { toast } from 'react-toastify';

import { appConfig } from 'config';
import { useAtom, useAtomValue } from 'jotai';
import { apiAtom, keyringAtom } from 'store/api';
import { createdDaoIdAtom, daosAtom } from 'store/dao';
import {
  accountsAtom,
  metamaskAccountAtom,
  substrateAccountAtom
} from 'store/account';

import { useDaoContract } from 'hooks/useDaoContract';
import { ssToEvmAddress } from 'utils/ssToEvmAddress';
import { keyringAddExternal } from 'utils/keyringAddExternal';

import { evmToAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { stringToHex } from '@polkadot/util';

import type { u32, Option } from '@polkadot/types';
import type { CreateDaoInput, DaoCodec } from 'types';

import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Radio } from 'components/ui-kit/Radio/Radio';
import { Notification } from 'components/ui-kit/Notifications';
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
  TOKEN_TYPE = 'tokenType',
  PROPOSAL_PERIOD = 'proposalPeriod',
  TOKEN_ADDRESS = 'tokenAddress',
  PROPOSAL_PERIOD_TYPE = 'proposalPeriodType',
  MIN_BALANCE = 'minBalance'
}

enum InputLabel {
  DAO_NAME = '* DAO Name',
  PURPOSE = '* Purpose',
  QUANTITY = 'Quantity of Tokens',
  ROLE = 'Role of Members',
  ADDRESS = 'New Member',
  TOKEN_NAME = 'Token Name',
  TOKEN_SYMBOL = 'Token Symbol',
  TOKEN_ADDRESS = 'ETH Token Address',
  PROPOSAL_PERIOD = 'Proposal Period',
  MIN_BALANCE = 'Min Balance of Tokens'
}

enum ProposalPeriod {
  DAYS = 'Days',
  HOURS = 'Hours'
}

enum TokenType {
  FUNGIBLE_TOKEN = 'Fungible Token',
  ETH_TOKEN = 'ETH Token Address'
}

const PURPOSE_INPUT_MAX_LENGTH = 500;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAYS = 24 * 60 * 60;

type Role = 'Council';

type State = {
  daoName: string;
  purpose: string;
  quantity: string;
  minBalance: string;
  role: Role;
  addresses: string[];
  tokenName: string;
  tokenSymbol: string;
  tokenType: TokenType;
  tokenAddress: string;
  proposalPeriod: string;
  proposalPeriodType: ProposalPeriod;
};

export function CreateDAO() {
  const router = useRouter();
  const [nextDaoId, setNextDaoId] = useState<number>(0);
  const api = useAtomValue(apiAtom);
  const keyring = useAtomValue(keyringAtom);
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
    minBalance: '',
    role: 'Council',
    addresses: [''],
    tokenName: '',
    tokenType: TokenType.FUNGIBLE_TOKEN,
    tokenAddress: '',
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

    toast.success(
      <Notification
        title="You've successfully created a new DAO"
        body="You can create new DAO and perform other actions."
        variant="success"
      />
    );
    router.push(`/daos/${currentDao.id}`);
  }, [createdDaoId, daos, router, state.daoName]);

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
    (state.tokenType === TokenType.FUNGIBLE_TOKEN &&
      (!state.tokenName || !state.tokenSymbol)) ||
    (state.tokenType === TokenType.ETH_TOKEN && !state.tokenAddress) ||
    !state.role ||
    !state.proposalPeriod ||
    !state.proposalPeriodType;

  const handleTransform = () => {
    if (nextDaoId === null || !keyring) {
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
      quantity,
      minBalance
    } = state;

    const proposal_period =
      (parseInt(proposalPeriod, 10) *
        (proposalPeriodType === ProposalPeriod.HOURS
          ? SECONDS_IN_HOUR
          : SECONDS_IN_DAYS)) /
      appConfig.expectedBlockTimeInSeconds;

    const initial_balance = quantity;
    const min_balance = minBalance;
    const token_id = nextDaoId;

    const data: CreateDaoInput = {
      name: daoName.trim(),
      purpose: purpose.trim(),
      metadata: 'metadata',
      policy: {
        proposal_period,
        approve_origin: { type: 'AtLeast', proportion: [1, 2] }
      }
    };

    if (state.tokenType === TokenType.FUNGIBLE_TOKEN) {
      data.token = {
        token_id,
        initial_balance,
        min_balance,
        metadata: {
          name: tokenName.trim(),
          symbol: tokenSymbol.trim(),
          decimals: 10
        }
      };
    } else if (state.tokenType === TokenType.ETH_TOKEN) {
      data.token_address = state.tokenAddress;
    }

    const _members = addresses
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
        if (_foundAccount?.type === 'sr25519') {
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
      toast.success(
        <Notification
          title="Transaction created"
          body="DAO will be created soon."
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
                      autoComplete="off"
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
        <div>
          <Typography variant="h3">Select Governance Token</Typography>
          <Typography variant="body1">
            Choose the type of your Governance token.
          </Typography>

          <RadioGroup
            name={InputName.TOKEN_TYPE}
            onChange={onInputChange}
            defaultValue={TokenType.FUNGIBLE_TOKEN}
          >
            {Object.values(TokenType).map((_tokenType) => (
              <Radio label={_tokenType} value={_tokenType} key={_tokenType} />
            ))}
          </RadioGroup>
        </div>
        {state.tokenType === TokenType.FUNGIBLE_TOKEN ? (
          <>
            <div className={styles['quantity-of-tokens']}>
              <Typography variant="h3">Min Balance of Tokens</Typography>
              <Typography variant="body1">
                Specify the number of tokens that account must have
              </Typography>

              <div className={styles['quantity-of-tokens-inputs']}>
                <Input
                  name={InputName.MIN_BALANCE}
                  label={InputLabel.MIN_BALANCE}
                  value={state.minBalance}
                  onChange={onInputChange}
                  type="tel"
                  required
                />
              </div>
            </div>
            <div className={styles['quantity-of-tokens']}>
              <Typography variant="h3">
                Select the Quantity of Tokens
              </Typography>
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
          </>
        ) : (
          <div className={styles['quantity-of-tokens']}>
            <Typography variant="h3">ETH Token Address</Typography>
            <Typography variant="body1">Specify ETH Token Address.</Typography>

            <div className={styles['quantity-of-tokens-inputs']}>
              <Input
                name={InputName.TOKEN_ADDRESS}
                label={InputLabel.TOKEN_ADDRESS}
                value={state.tokenAddress}
                onChange={onInputChange}
                required
              />
            </div>
          </div>
        )}

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
