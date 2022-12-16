import {
  ChangeEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useState
} from 'react';
import { useAtomValue } from 'jotai';
import Link from 'next/link';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Radio } from 'components/ui-kit/Radio/Radio';

import { TxButton } from 'components/TxButton';
import { apiAtom, currentAccountAtom } from 'store/api';

import { FunctionArgumentMetadataV14 } from '@polkadot/types/interfaces';

import { transformParams } from 'utils';

import styles from './CreateDAO.module.scss';

const argIsOptional = (arg: FunctionArgumentMetadataV14) =>
  arg.type.toString().startsWith('Option<');

enum InputName {
  DAO_NAME = 'daoName',
  PURPOSE = 'purpose',
  QUANTITY = 'quantity',
  ADDRESSES = 'addresses',
  ROLE = 'role',
  TOKEN_NAME = 'tokenName',
  TOKEN_SYMBOL = 'tokenSymbol',
  PROPOSAL_PERIOD = 'proposalPeriod',
  PROPOSAL_PERIOD_TYPE = 'proposalPeriodType',
  TOKEN_ID = 'tokenId'
}

enum InputLabel {
  DAO_NAME = '* DAO Name',
  PURPOSE = '* Purpose',
  QUANTITY = 'Quantity of Tokens',
  ROLE = 'Role of Members',
  ADDRESS = 'Add New Address',
  TOKEN_NAME = 'Token Name',
  TOKEN_SYMBOL = 'Token Symbol',
  PROPOSAL_PERIOD = 'Proposal Period',
  TOKEN_ID = 'Specify Token ID'
}

enum ProposalPeriod {
  DAYS = 'Days',
  HOURS = 'Hours'
}

const PURPOSE_INPUT_MAX_LENGTH = 500;
const SECONDS_IN_HOUR = 60 * 60;
const SECONDS_IN_DAY = 24 * 60 * 60;

type Role = 'Council';

type CreateDAOState = {
  daoName: string;
  purpose: string;
  quantity: string;
  role: Role;
  addresses: string[];
  tokenName: string;
  tokenSymbol: string;
  proposalPeriod: string;
  proposalPeriodType: ProposalPeriod;
  tokenId: string;
};

export function CreateDAO() {
  const api = useAtomValue(apiAtom);
  const currentAccount = useAtomValue(currentAccountAtom);

  const [paramFields, setParamFields] = useState<
    { name: string; type: string; optional: boolean }[] | null
  >(null);

  const [createDAOState, setCreateDAOState] = useState<CreateDAOState>({
    daoName: '',
    purpose: '',
    quantity: '',
    role: 'Council',
    addresses: [''],
    tokenId: '',
    tokenName: '',
    tokenSymbol: '',
    proposalPeriod: '',
    proposalPeriodType: ProposalPeriod.DAYS
  });

  useEffect(() => {
    if (!api) {
      return;
    }

    const metaArgs = api.tx.dao.createDao.meta.args;

    if (!metaArgs || !metaArgs.length) {
      return;
    }

    setParamFields(
      metaArgs.map((arg) => ({
        name: arg.name.toString(),
        type: arg.type.toString(),
        optional: argIsOptional(arg)
      }))
    );
  }, [api]);

  const onInputChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name;
    const targetValue = target.value;
    const dataAddressIndex = target.getAttribute('data-address-index');

    if (dataAddressIndex && targetName === InputName.ADDRESSES) {
      const addressIndex = parseInt(dataAddressIndex, 10);
      setCreateDAOState((prevState) => ({
        ...prevState,
        addresses: prevState.addresses.map((x, index) =>
          addressIndex === index ? targetValue : x
        )
      }));

      return;
    }

    setCreateDAOState((prevState) => ({
      ...prevState,
      [targetName]:
        targetName === InputName.QUANTITY ||
        targetName === InputName.PROPOSAL_PERIOD ||
        targetName === InputName.TOKEN_ID
          ? targetValue.replace(/[^0-9]/g, '')
          : targetValue
    }));
  };

  const handleAddAddressClick: MouseEventHandler = () => {
    setCreateDAOState((prevState) => ({
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
    setCreateDAOState((prevState) => ({
      ...prevState,
      addresses: prevState.addresses.filter(
        (_, index) => index !== addressIndex
      )
    }));
  };

  const formatInput = useCallback(() => {
    const {
      daoName,
      purpose,
      proposalPeriod,
      proposalPeriodType,
      tokenName,
      tokenSymbol,
      tokenId,
      addresses,
      quantity
    } = createDAOState;
    if (!paramFields) {
      return [];
    }
    const proposal_period =
      parseInt(proposalPeriod, 10) *
      (proposalPeriodType === ProposalPeriod.HOURS
        ? SECONDS_IN_HOUR
        : SECONDS_IN_DAY);

    const min_balance = quantity;

    const data = {
      name: daoName,
      purpose,
      metadata: 'metadata',
      policy: {
        proposal_bond: 1,
        proposal_bond_min: 1,
        proposal_period,
        approve_origin: [1, 2],
        reject_origin: [1, 2]
      },
      token: {
        token_id: parseInt(tokenId, 10),
        min_balance,
        metadata: {
          name: tokenName,
          symbol: tokenSymbol,
          decimals: 10
        }
      }
    };

    return paramFields.map((x) => ({
      type: x.type,
      value:
        x.name === 'council'
          ? addresses
              .filter((address) => address.length > 0)
              .map((address) => address.trim())
              .join(',')
          : JSON.stringify(data)
    }));
  }, [createDAOState, paramFields]);

  const isDisabled =
    !createDAOState.daoName ||
    !createDAOState.purpose ||
    !createDAOState.tokenName ||
    !createDAOState.tokenId ||
    !createDAOState.role ||
    !createDAOState.tokenSymbol ||
    !createDAOState.proposalPeriod ||
    !createDAOState.proposalPeriodType;

  const handleTransform = useCallback(() => {
    if (!paramFields) {
      return null;
    }
    return transformParams(paramFields, formatInput());
  }, [formatInput, paramFields]);

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
            value={createDAOState.daoName}
            onChange={onInputChange}
            required
          />
          <Input
            name={InputName.PURPOSE}
            label={InputLabel.PURPOSE}
            onChange={onInputChange}
            value={createDAOState.purpose}
            maxLength={PURPOSE_INPUT_MAX_LENGTH}
            hint={
              <Typography variant="caption3">
                {createDAOState.purpose.length}/500
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
              name={InputName.ROLE}
              label={InputLabel.ROLE}
              value={createDAOState.role}
              classNames={{
                root: styles['members-inputs-role-root'],
                input: styles['members-inputs-role-input']
              }}
              required
              disabled
            />
            <div className={styles['members-addresses']}>
              {createDAOState.addresses.map((x, index) => {
                const lastItem = index === createDAOState.addresses.length - 1;
                const key = `address-${index}`;

                return (
                  <Input
                    key={key}
                    data-address-index={index}
                    name={InputName.ADDRESSES}
                    label={InputLabel.ADDRESS}
                    value={createDAOState.addresses[index]}
                    onChange={onInputChange}
                    required
                    endAdornment={
                      <Button
                        data-address-index={index}
                        variant="ghost"
                        className={styles['members-add-button']}
                        onClick={
                          lastItem
                            ? handleAddAddressClick
                            : handleRemoveAddressClick
                        }
                        size="sm"
                      >
                        <Icon name={lastItem ? 'add' : 'close'} size="sm" />
                      </Button>
                    }
                  />
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
              name={InputName.TOKEN_ID}
              label={InputLabel.TOKEN_ID}
              value={createDAOState.tokenId}
              onChange={onInputChange}
              type="tel"
              required
            />

            <Input
              name={InputName.QUANTITY}
              label={InputLabel.QUANTITY}
              value={createDAOState.quantity}
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
              value={createDAOState.tokenName}
              onChange={onInputChange}
              required
            />
            <Input
              name={InputName.TOKEN_SYMBOL}
              label={InputLabel.TOKEN_SYMBOL}
              value={createDAOState.tokenSymbol}
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
              value={createDAOState.proposalPeriod}
              onChange={onInputChange}
              type="tel"
              required
              endAdornment={
                <Dropdown
                  dropdownItems={
                    <Card dropdown className={styles['dropdown-card']}>
                      <RadioGroup
                        value={createDAOState.proposalPeriodType}
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
                        {createDAOState.proposalPeriodType}
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
          {paramFields && (
            <TxButton
              isDisabled={isDisabled}
              accountId={currentAccount?.address}
              params={handleTransform}
              tx={api?.tx.dao.createDao}
              className={styles['create-button']}
            >
              Create DAO
            </TxButton>
          )}
        </div>
      </div>
    </div>
  );
}
