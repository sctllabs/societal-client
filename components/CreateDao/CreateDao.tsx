import { useState } from 'react';
import Link from 'next/link';

import { useAtomValue } from 'jotai';
import { daoDetailsDisabledAtom } from 'store/dao';

import { CreateDaoSteps } from 'constants/steps';

import { Button } from 'components/ui-kit/Button';
import { Typography } from 'components/ui-kit/Typography';
import { Stepper } from 'components/ui-kit/Stepper';
import { Icon } from 'components/ui-kit/Icon';

import { DaoDetails } from './DaoDetails';

import styles from './CreateDao.module.scss';
import { DaoAssets } from './DaoAssets';
import { DaoMembers } from './DaoMembers';

export function CreateDao() {
  const [activeStep, setActiveStep] = useState(0);
  const daoDetailsDisabled = useAtomValue(daoDetailsDisabledAtom);

  const handleNextStep = () => {
    if (activeStep === CreateDaoSteps.length) {
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

  let disabled: boolean;

  switch (activeStep) {
    case 0: {
      disabled = daoDetailsDisabled;
      break;
    }
    default: {
      disabled = false;
    }
  }

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
        <Stepper activeStep={activeStep} steps={CreateDaoSteps} />
      </div>
      <div className={styles.content}>
        {activeStep === 0 && (
          <div className={styles.details}>
            <DaoDetails />
            <DaoAssets />
            <DaoMembers />
          </div>
        )}
      </div>
      <div className={styles.navigation}>
        {activeStep !== 0 && (
          <Button
            className={styles.previous}
            variant="outlined"
            onClick={handlePreviousStep}
          >
            <Icon name="arrow-left" />
            Previous Step
          </Button>
        )}

        <Button
          className={styles.next}
          onClick={handleNextStep}
          disabled={disabled}
        >
          Next Step
          <Icon name="arrow-right" />
        </Button>
      </div>
    </div>
  );
}
