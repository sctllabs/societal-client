import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useAtomValue, useSetAtom } from 'jotai';
import {
  additionalInfoSectionDisabledAtom,
  detailsSectionDisabledAtom,
  governanceSectionDisabledAtom,
  resetCreateDaoAtom,
  votingTermsSectionDisabledAtom
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
import { TokenInfo } from './TokenInfo';
import { TokenSymbol } from './TokenSymbol';

import { TokenQuantity } from './TokenQuantity';
import { ApproveOrigin } from './ApproveOrigin';
import { Periods } from './Periods';
import { Links } from './Links';
import { CreateDaoButton } from './CreateDaoButton';
import { TokenDecimals } from './TokenDecimals';
import { Pending } from './Pending';

import styles from './CreateDao.module.scss';

export function CreateDao() {
  const [activeStep, setActiveStep] = useState(0);
  const detailsSectionDisabled = useAtomValue(detailsSectionDisabledAtom);
  const governanceSectionDisabled = useAtomValue(governanceSectionDisabledAtom);
  const votingTermsSectionDisabled = useAtomValue(
    votingTermsSectionDisabledAtom
  );
  const additionalInfoSectionDisabled = useAtomValue(
    additionalInfoSectionDisabledAtom
  );
  const resetCreateDao = useSetAtom(resetCreateDaoAtom);

  useEffect(() => () => resetCreateDao(), [resetCreateDao]);

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
        return detailsSectionDisabled;
      }
      case 1: {
        return governanceSectionDisabled;
      }
      case 2: {
        return votingTermsSectionDisabled;
      }
      case 3: {
        return additionalInfoSectionDisabled;
      }
      default: {
        return true;
      }
    }
  }, [
    activeStep,
    additionalInfoSectionDisabled,
    detailsSectionDisabled,
    governanceSectionDisabled,
    votingTermsSectionDisabled
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
              <TokenInfo />
              <TokenSymbol />
              <TokenQuantity />
              <TokenDecimals />
            </>
          )}
          {activeStep === 2 && (
            <>
              <ApproveOrigin />
              <Periods />
            </>
          )}
          {activeStep === 3 && <Links />}
          {activeStep === 4 && <Pending />}
        </div>
      </div>
      {activeStep < createDaoSteps.length && (
        <div className={styles.navigation}>
          {activeStep < 3 && (
            <Button
              className={styles.next}
              onClick={handleNextStep}
              disabled={disabled}
            >
              Next Step
              <Icon name="arrow-right" size="xs" />
            </Button>
          )}
          {activeStep === 3 && (
            <CreateDaoButton
              handleNextStep={handleNextStep}
              disabled={disabled}
            />
          )}

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
