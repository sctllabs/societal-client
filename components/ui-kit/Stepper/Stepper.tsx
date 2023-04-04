import clsx from 'clsx';
import styles from './Stepper.module.scss';
import { Typography } from '../Typography';
import { Icon } from '../Icon';

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
            <Icon
              name={active ? 'circle' : 'noti-success-filled'}
              className={clsx(styles.icon, {
                [styles['icon-active']]: active,
                [styles.shallow]: index > activeStep
              })}
            />
            <Typography variant="title7">{step}</Typography>
          </li>
        );
      })}
    </ul>
  );
}
