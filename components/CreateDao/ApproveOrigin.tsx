import { useSetAtom } from 'jotai';
import { approveOriginAtom } from 'store/createDao';

import { ApproveOriginType } from 'constants/governance';

import * as Label from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from 'components/ui-kit/Radio';
import { Typography } from 'components/ui-kit/Typography';
import { CircularProgress } from 'components/ui-kit/CircularProgress';

import styles from './CreateDao.module.scss';

export function ApproveOrigin() {
  const setApproveOrigin = useSetAtom(approveOriginAtom);

  const onApproveOriginChange = (value: ApproveOriginType) => {
    setApproveOrigin(value);
  };

  return (
    <div className={styles.section}>
      <Typography variant="h3">Approve Origin</Typography>
      <Typography variant="body1">
        Basic quorum required for council proposals to be approved.
      </Typography>

      <RadioGroup
        className={styles['approve-origin-radio-group']}
        defaultValue={ApproveOriginType['50%']}
        onValueChange={onApproveOriginChange}
      >
        {(
          Object.keys(ApproveOriginType) as (keyof typeof ApproveOriginType)[]
        ).map((_approveOriginKey, index) => (
          <div
            key={_approveOriginKey}
            className={styles['approve-origin-radio']}
          >
            <span className={styles['approve-origin-radio-span']}>
              <RadioGroupItem
                autoFocus={index === 0}
                id={_approveOriginKey}
                value={ApproveOriginType[_approveOriginKey]}
              />
              <Label.Root htmlFor={_approveOriginKey}>
                <Typography variant="body2">
                  {ApproveOriginType[_approveOriginKey]}
                </Typography>
              </Label.Root>
            </span>
            <CircularProgress
              value={parseInt(_approveOriginKey.replace('%', ''), 10)}
            />
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
