import clsx from 'clsx';
import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';
import styles from './Stepper.module.scss';

type StepperProps = {
  activeStep: number;
  steps: string[];
};

export function Stepper({ activeStep, steps }: StepperProps) {
  return (
    <ul className={styles.root}>
      {steps.map((step, index) => {
        const key = `${index}-${step}`;
        const active = index === activeStep;

        return (
          <li
            key={key}
            className={clsx(styles.step, {
              [styles['active-step']]: active
            })}
          >
            <span className={styles['icon-wrapper']}>
              <Icon
                name={active ? 'circle' : 'noti-success-filled'}
                className={clsx(styles.icon, {
                  [styles['icon-active']]: active,
                  [styles.shallow]: index > activeStep
                })}
              />
            </span>
            <Typography variant="title7">{step}</Typography>
          </li>
        );
      })}
    </ul>
  );
}
