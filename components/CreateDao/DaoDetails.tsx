import { ChangeEventHandler } from 'react';
import { useAtom } from 'jotai';
import { daoMetadataAtom, daoNameAtom, daoPurposeAtom } from 'store/dao';

import { Typography } from 'components/ui-kit/Typography';
import { Input } from 'components/ui-kit/Input';

import styles from './CreateDao.module.scss';

enum InputName {
  NAME = 'name',
  PURPOSE = 'purpose',
  METADATA = 'metadata'
}

enum InputLabel {
  NAME = 'Community Name',
  PURPOSE = 'Purpose',
  METADATA = 'Metadata'
}

const PURPOSE_INPUT_MAX_LENGTH = 500;
const METADATA_INPUT_MAX_LENGTH = 500;

export function DaoDetails() {
  const [daoName, setDaoName] = useAtom(daoNameAtom);
  const [daoPurpose, setDaoPurpose] = useAtom(daoPurposeAtom);
  const [daoMetadata, setDaoMetadata] = useAtom(daoMetadataAtom);

  const onChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name as InputName;
    const targetValue = target.value;

    switch (targetName) {
      case InputName.NAME: {
        setDaoName(targetValue);
        break;
      }
      case InputName.PURPOSE: {
        setDaoPurpose(targetValue);
        break;
      }
      case InputName.METADATA: {
        setDaoMetadata(targetValue);
        break;
      }
      default: {
        throw new Error('Unexpected input');
      }
    }
  };

  return (
    <div className={styles.info}>
      <Typography variant="h3">Community Info</Typography>
      <Input
        classNames={{ root: styles['input-half-width'] }}
        name={InputName.NAME}
        label={InputLabel.NAME}
        value={daoName}
        onChange={onChange}
        required
      />
      <Input
        name={InputName.PURPOSE}
        label={InputLabel.PURPOSE}
        onChange={onChange}
        value={daoPurpose}
        maxLength={PURPOSE_INPUT_MAX_LENGTH}
        hint={
          <Typography variant="caption3">
            {daoPurpose?.length || 0}/500
          </Typography>
        }
        hintPosition="end"
        required
      />
      <Input
        name={InputName.METADATA}
        label={InputLabel.METADATA}
        onChange={onChange}
        value={daoMetadata}
        maxLength={METADATA_INPUT_MAX_LENGTH}
        hint={
          <Typography variant="caption3">
            {daoMetadata?.length || 0}/500
          </Typography>
        }
        hintPosition="end"
        required
      />
    </div>
  );
}
