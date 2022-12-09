import clsx from 'clsx';

import { Button } from 'components/ui-kit/Button';
import { Dropdown } from 'components/ui-kit/Dropdown';
import { Card } from 'components/ui-kit/Card';
import { Typography } from 'components/ui-kit/Typography';

import styles from './Header.module.scss';

const accountOptions: string[] = ['0xaf...25d6', '0xaf...25d7', '0xaf...25d8'];

export function Header() {
  return (
    <header className={styles.root}>
      <div className={styles.container}>
        <div className={clsx(styles.leftContainer)}></div>
        <div className={clsx(styles.rightContainer)}>
          <Dropdown
            className={styles.dropdown}
            dropdownItems={
              <Card className={styles['dropdown-card']}>
                <Typography
                  variant={'body2'}
                  className={styles['dropdown-title']}
                >
                  Please select address to use
                </Typography>
                {accountOptions.map((x) => (
                  <Button
                    key={x}
                    variant={'text'}
                    startIcon={'user-profile'}
                    className={styles['dropdown-button']}
                    fullWidth
                  >
                    0xaf...25d6
                  </Button>
                ))}
              </Card>
            }
          >
            <Button
              startIcon={'user-profile'}
              endIcon={'arrow-down'}
              variant={'text'}
              className={styles['account-button']}
            >
              Choose an account
            </Button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
