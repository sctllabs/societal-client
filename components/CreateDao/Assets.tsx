import { useSetAtom } from 'jotai';
import { assetAtom } from 'store/createDao';

import { Typography } from 'components/ui-kit/Typography';
import { Icon } from 'components/ui-kit/Icon';
import { DropFile } from 'components/ui-kit/DropFile';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from 'components/ui-kit/Tooltip';

import styles from './CreateDao.module.scss';

const acceptedFiles = { 'image/png': [], 'image/jpeg': [], 'image.jpg': [] };

export function Assets() {
  const setAsset = useSetAtom(assetAtom);

  const handleAssetChange = (file: File | undefined) => setAsset(file);

  return (
    <div className={styles.assets}>
      <div className={styles['assets-text']}>
        <Typography variant="h3">DAO Assets</Typography>
        <Typography variant="body1">
          Select a logo and a cover out of a Basic (free) plan set of assets or
          check out our Subscription Plans to bring brand identity into your
          DAO.
        </Typography>
      </div>
      <div className={styles['assets-logo']}>
        <div className={styles['assets-logo-title']}>
          <Typography variant="title4">Logo</Typography>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Icon
                    className={styles['assets-logo-icon']}
                    name="noti-info-stroke"
                    size="xs"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>Your text goes here</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <DropFile
          variant="rectangle"
          accept={acceptedFiles}
          onFileChange={handleAssetChange}
        />
      </div>
    </div>
  );
}
