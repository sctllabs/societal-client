import { ChangeEventHandler } from 'react';
import { useAtom } from 'jotai';
import { metadataAtom, nameAtom, purposeAtom } from 'store/createDao';

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

export function Details() {
  const [name, setName] = useAtom(nameAtom);
  const [purpose, setPurpose] = useAtom(purposeAtom);
  const [metadata, setMetadata] = useAtom(metadataAtom);

  const onChange: ChangeEventHandler = (e) => {
    const target = e.target as HTMLInputElement;
    const targetName = target.name as InputName;
    const targetValue = target.value;

    switch (targetName) {
      case InputName.NAME: {
        setName(targetValue);
        break;
      }
      case InputName.PURPOSE: {
        setPurpose(targetValue);
        break;
      }
      case InputName.METADATA: {
        setMetadata(targetValue);
        break;
      }
      default: {
        throw new Error('Unexpected input');
      }
    }
  };

  return (
    <div className={styles.section}>
      <Typography variant="h3">Community Info</Typography>
      <Input
        classNames={{ root: styles['input-half-width'] }}
        name={InputName.NAME}
        label={InputLabel.NAME}
        value={name}
        onChange={onChange}
        autoFocus
        required
      />
      <Input
        name={InputName.PURPOSE}
        label={InputLabel.PURPOSE}
        onChange={onChange}
        value={purpose}
        maxLength={PURPOSE_INPUT_MAX_LENGTH}
        hint={
          <Typography variant="caption3">{purpose?.length || 0}/500</Typography>
        }
        hintPosition="end"
        required
      />
      <Input
        name={InputName.METADATA}
        label={InputLabel.METADATA}
        onChange={onChange}
        value={metadata}
        maxLength={METADATA_INPUT_MAX_LENGTH}
        hint={
          <Typography variant="caption3">
            {metadata?.length || 0}/500
          </Typography>
        }
        hintPosition="end"
        required
      />
    </div>
  );
}
