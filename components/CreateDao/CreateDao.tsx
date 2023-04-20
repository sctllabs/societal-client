import { useMemo, useState } from 'react';
import Link from 'next/link';

import { useAtomValue } from 'jotai';
import {
  daoDetailsSectionDisabledAtom,
  daoGovernanceSectionDisabledAtom,
  daoVotingTermsSectionDisabledAtom
} from 'store/createDao';

import { createDaoSteps } from 'constants/steps';

import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { Stepper } from 'components/ui-kit/Stepper';
import { Icon } from 'components/ui-kit/Icon';

import { Details } from './Details';
import { Assets } from './Assets';
import { Members } from './Members';
import { GovernanceToken } from './GovernanceToken';
import { GovernanceType } from './GovernanceType';
import { TokenTicker } from './TokenTicker';
import { TokenSymbol } from './TokenSymbol';

import { TokenQuantity } from './TokenQuantity';
import { ApproveOrigin } from './ApproveOrigin';
import { Periods } from './Periods';
import { Links } from './Links';

import styles from './CreateDao.module.scss';

export function CreateDao() {
  const [activeStep, setActiveStep] = useState(0);
  const daoDetailsSectionDisabled = useAtomValue(daoDetailsSectionDisabledAtom);
  const daoGovernanceSectionDisabled = useAtomValue(
    daoGovernanceSectionDisabledAtom
  );
  const daoVotingTermsSectionDisabled = useAtomValue(
    daoVotingTermsSectionDisabledAtom
  );

  const handleNextStep = () => {
    if (activeStep === createDaoSteps.length) {
      return;
    }

    setActiveStep((prevState) => prevState + 1);
  };

  const handlePreviousStep = () => {
    if (activeStep === 0) {
      return;
    }

    setActiveStep((prevState) => prevState - 1);
  };

  const disabled = useMemo(() => {
    switch (activeStep) {
      case 0: {
        return daoDetailsSectionDisabled;
      }
      case 1: {
        return daoGovernanceSectionDisabled;
      }
      case 2: {
        return daoVotingTermsSectionDisabled;
      }
      case 3: {
        return false;
      }
      default: {
        return true;
      }
    }
  }, [
    activeStep,
    daoDetailsSectionDisabled,
    daoGovernanceSectionDisabled,
    daoVotingTermsSectionDisabled
  ]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles['cancel-button']}>
        <Button variant="outlined" color="destructive" size="sm">
          Cancel creation
        </Button>
      </Link>

      <div className={styles.header}>
        <Typography variant="h1" className={styles.title}>
          Create A Tokenized Community
        </Typography>
        <Stepper activeStep={activeStep} steps={createDaoSteps} />
      </div>
      <div className={styles.content}>
        <div className={styles.details}>
          {activeStep === 0 && (
            <>
              <Details />
              <Assets />
              <Members />
            </>
          )}
          {activeStep === 1 && (
            <>
              <GovernanceToken />
              <GovernanceType />
              <TokenTicker />
              <TokenSymbol />
              <TokenQuantity />
            </>
          )}
          {activeStep === 2 && (
            <>
              <ApproveOrigin />
              <Periods />
            </>
          )}
          {activeStep === 3 && <Links />}
        </div>
      </div>
      {activeStep < createDaoSteps.length && (
        <div className={styles.navigation}>
          <Button
            className={styles.next}
            onClick={handleNextStep}
            disabled={disabled}
          >
            {activeStep === 3 ? 'Create DAO' : 'Next Step'}
            <Icon name={activeStep === 3 ? 'tick' : 'arrow-right'} size="xs" />
          </Button>

          {activeStep !== 0 && (
            <Button
              className={styles.previous}
              variant="outlined"
              onClick={handlePreviousStep}
            >
              <Icon name="arrow-left" size="xs" />
              Previous Step
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
