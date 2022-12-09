import Head from 'next/head';

import styles from 'styles/pages/Home.module.scss';
import Image from 'next/image';
import { Typography } from '../components/ui-kit/Typography';
import { Card } from '../components/ui-kit/Card';

type ContentInfo = {
  title: string;
  description: string;
};

const contentInfo: ContentInfo[] = [
  {
    title: '2.5 K',
    description: 'DAOs'
  },
  {
    title: '150 K',
    description: 'Users'
  },
  {
    title: '800 K',
    description: 'Proposals'
  }
];
export default function Home() {
  return (
    <>
      <Head>
        <title>Societal - Welcome to Society 3.0</title>
        <meta name="description" content="Societal web application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.content}>
        <div className={styles.logo}>
          <Image
            src={'/logo/societal-primary.svg'}
            alt={'societal-symbol'}
            fill
          />
        </div>

        <Typography className={styles.title} variant={'paragraph1'}>
          Welcome to society 3.0
        </Typography>

        <div className={styles['cards-wrapper']}>
          {contentInfo.map((x) => (
            <Card className={styles.card} key={x.title}>
              <Typography variant={'value1'}>{x.title}</Typography>
              <Typography variant={'caption1'}>{x.description}</Typography>
            </Card>
          ))}
        </div>

        <div className={styles.logo}>
          <Image
            src={'/logo/societal-primary.svg'}
            alt={'societal-symbol'}
            fill
          />
        </div>

        <Typography className={styles.title} variant={'paragraph1'}>
          Welcome to society 3.0
        </Typography>

        <div className={styles['cards-wrapper']}>
          {contentInfo.map((x) => (
            <Card className={styles.card} key={x.title}>
              <Typography variant={'value1'}>{x.title}</Typography>
              <Typography variant={'caption1'}>{x.description}</Typography>
            </Card>
          ))}
        </div>

        <div className={styles.logo}>
          <Image
            src={'/logo/societal-primary.svg'}
            alt={'societal-symbol'}
            fill
          />
        </div>

        <Typography className={styles.title} variant={'paragraph1'}>
          Welcome to society 3.0
        </Typography>

        <div className={styles['cards-wrapper']}>
          {contentInfo.map((x) => (
            <Card className={styles.card} key={x.title}>
              <Typography variant={'value1'}>{x.title}</Typography>
              <Typography variant={'caption1'}>{x.description}</Typography>
            </Card>
          ))}
        </div>

        <div className={styles.logo}>
          <Image
            src={'/logo/societal-primary.svg'}
            alt={'societal-symbol'}
            fill
          />
        </div>

        <Typography className={styles.title} variant={'paragraph1'}>
          Welcome to society 3.0
        </Typography>

        <div className={styles['cards-wrapper']}>
          {contentInfo.map((x) => (
            <Card className={styles.card} key={x.title}>
              <Typography variant={'value1'}>{x.title}</Typography>
              <Typography variant={'caption1'}>{x.description}</Typography>
            </Card>
          ))}
        </div>

        <div className={styles.logo}>
          <Image
            src={'/logo/societal-primary.svg'}
            alt={'societal-symbol'}
            fill
          />
        </div>

        <Typography className={styles.title} variant={'paragraph1'}>
          Welcome to society 3.0
        </Typography>

        <div className={styles['cards-wrapper']}>
          {contentInfo.map((x) => (
            <Card className={styles.card} key={x.title}>
              <Typography variant={'value1'}>{x.title}</Typography>
              <Typography variant={'caption1'}>{x.description}</Typography>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
