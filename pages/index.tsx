import Head from 'next/head';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Radio } from 'components/ui-kit/Radio/Radio';

export default function Home() {
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Typography variant={'h1'}>Hello, world!</Typography>
      <Typography variant={'h2'}>Hello, world!</Typography>
      <Typography variant={'h3'}>Hello, world!</Typography>

      {/*  radio group  */}
      <RadioGroup>
        <div>
          <Radio value={'One'} id="defaultRule" name="royaltyRule" />
          <label htmlFor="defaultRule">Default</label>
        </div>
        <div>
          <Radio value={'Two'} id="manualRule" name="royaltyRule" />
          <label htmlFor="manualRule">Manual</label>
        </div>
      </RadioGroup>

      {/*  link buttons   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button variant={'link'}>Button</Button>
      </div>

      {/*  filled buttons   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button variant={'filled'} color={'primary'}>
          Button
        </Button>
        <Button variant={'filled'} color={'destructive'}>
          Button
        </Button>
      </div>

      {/*  outlined buttons   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button variant={'outlined'} color={'primary'}>
          Button
        </Button>
        <Button variant={'outlined'} color={'destructive'}>
          Button
        </Button>
      </div>

      {/*  text buttons   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button variant={'text'} color={'primary'}>
          Button
        </Button>
        <Button variant={'text'} color={'destructive'}>
          Button
        </Button>
      </div>

      {/*  size buttons   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button variant={'filled'} size={'lg'}>
          Button
        </Button>
        <Button variant={'filled'} size={'md'}>
          Button
        </Button>
        <Button variant={'filled'} size={'sm'}>
          Button
        </Button>
      </div>

      {/*  icon buttons   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button variant={'outlined'} icon>
          <Icon name={'placeholder'} />
        </Button>
        <Button variant={'icon'} icon>
          <Icon name={'placeholder'} />
        </Button>
        <Button variant={'outlined'} color={'destructive'} icon>
          <Icon name={'placeholder'} />
        </Button>
        <Button variant={'icon'} icon>
          <Icon name={'placeholder'} />
        </Button>
        <Button variant={'ghost'} icon>
          <Icon name={'placeholder'} />
        </Button>
      </div>

      {/*  buttons with icon   */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px'
        }}
      >
        <Button
          style={{ width: '216px' }}
          iconLeft={'social-google'}
          variant={'outlined'}
        >
          Google
        </Button>
        <Button
          style={{ width: '216px' }}
          iconLeft={'social-apple'}
          variant={'outlined'}
        >
          Apple
        </Button>
      </div>
    </>
  );
}
