import { useSetAtom } from 'jotai';
import { tokenSymbolAtom } from 'store/createDao';

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

export function TokenSymbol() {
  const setTokenSymbol = useSetAtom(tokenSymbolAtom);

  const handleAssetChange = (file: File | undefined) => setTokenSymbol(file);

  return (
    <div className={styles.assets}>
      <div className={styles['assets-text']}>
        <Typography variant="h3">Token Symbol</Typography>
        <Typography variant="body1">
          Upload the symbol of your Governance Token now, or you can do it later
          in your DAO settings.
        </Typography>
      </div>
      <div className={styles['assets-logo']}>
        <div className={styles['assets-logo-title']}>
          <Typography variant="title4">Symbol</Typography>
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
          variant="circle"
          accept={acceptedFiles}
          onFileChange={handleAssetChange}
        />
      </div>
    </div>
  );
}
