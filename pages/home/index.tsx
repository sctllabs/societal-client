import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from 'components/ui-kit/Tabs';
import { Typography } from 'components/ui-kit/Typography';
import styles from 'styles/pages/home.module.scss';

type TabOption = 'Your Task Board' | 'Proposal Calendar';
const tabOptions: TabOption[] = ['Your Task Board', 'Proposal Calendar'];

export default function HomePage() {
  const [tab, setTab] = useState<TabOption>('Your Task Board');

  const onTabValueChange = (value: string) => setTab(value as TabOption);

  return (
    <div className={styles.container}>
      <div className={styles['tabs-container']}>
        <Tabs
          value={tab}
          onValueChange={onTabValueChange}
          className={styles.tabs}
        >
          <TabsList>
            {tabOptions.map((tabOption) => (
              <TabsTrigger value={tabOption} key={tabOption} asChild>
                <Typography variant="title2">{tabOption}</Typography>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
