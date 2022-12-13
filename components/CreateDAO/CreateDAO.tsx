import { ChangeEventHandler, MouseEventHandler, useState } from 'react';
import Link from 'next/link';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Input } from 'components/ui-kit/Input';
import { Icon } from 'components/ui-kit/Icon';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Radio } from 'components/ui-kit/Radio/Radio';

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
  ADDRESS = 'Add New Address',
  TOKEN_NAME = 'Token Name',
  TOKEN_SYMBOL = 'Token Symbol',
  PROPOSAL_PERIOD = 'Proposal Period'
}

enum ProposalPeriod {
  DAYS = 'Days',
  HOURS = 'Hours'
}

const PURPOSE_INPUT_MAX_LENGTH = 500;

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
};

export function CreateDAO() {
  const [createDAOState, setCreateDAOState] = useState<CreateDAOState>({
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
        targetName === InputName.PROPOSAL_PERIOD
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

  const handleCreateClick: MouseEventHandler = () => {};

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

          <Input
            name={InputName.QUANTITY}
            label={InputLabel.QUANTITY}
            value={createDAOState.quantity}
            onChange={onInputChange}
            type="tel"
            required
          />
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
          <Button
            className={styles['create-button']}
            onClick={handleCreateClick}
          >
            Create DAO
          </Button>
        </div>
      </div>
    </div>
  );
}
