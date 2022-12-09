import Head from 'next/head';
import { Typography } from 'components/ui-kit/Typography';
import { Button } from 'components/ui-kit/Button';
import { Icon } from 'components/ui-kit/Icon';
import { RadioGroup } from 'components/ui-kit/Radio/RadioGroup';
import { Radio } from 'components/ui-kit/Radio/Radio';
import { Checkbox } from 'components/ui-kit/Checkbox';
import Switch from 'components/ui-kit/Switch/Switch';
import { Input } from 'components/ui-kit/Input';

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

      {/*  Input  */}

      {/*<div*/}
      {/*  style={{*/}
      {/*    padding: '8px',*/}
      {/*    display: 'flex',*/}
      {/*    gap: '8px',*/}
      {/*    flexDirection: 'column',*/}
      {/*    maxWidth: '328px'*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <Input*/}
      {/*    variant={'outlined'}*/}
      {/*    padding={'lg'}*/}
      {/*    placeholder={'Search'}*/}
      {/*    hint={'Text'}*/}
      {/*  />*/}
      {/*  <Input*/}
      {/*    padding={'lg'}*/}
      {/*    startAdornment={*/}
      {/*      <Button variant={'ghost'} icon size={'sm'}>*/}
      {/*        <Icon name={'search'} size={'sm'} />*/}
      {/*      </Button>*/}
      {/*    }*/}
      {/*    endAdornment={*/}
      {/*      <Button variant={'ghost'} icon size={'sm'}>*/}
      {/*        <Icon name={'close'} size={'sm'} />*/}
      {/*      </Button>*/}
      {/*    }*/}
      {/*    hint={'Text'}*/}
      {/*    placeholder={'Search'}*/}
      {/*    variant={'outlined'}*/}
      {/*  />*/}
      {/*  <Input*/}
      {/*    endAdornment={*/}
      {/*      <Button variant={'ghost'} icon size={'sm'}>*/}
      {/*        <Icon name={'close'} size={'sm'} />*/}
      {/*      </Button>*/}
      {/*    }*/}
      {/*    hint={'Text'}*/}
      {/*    variant={'outlined'}*/}
      {/*    label={'Label'}*/}
      {/*  />*/}

      {/*  <Input*/}
      {/*    placeholder={'Fata'}*/}
      {/*    endAdornment={*/}
      {/*      <Button variant={'ghost'} icon size={'sm'}>*/}
      {/*        <Icon name={'close'} size={'sm'} />*/}
      {/*      </Button>*/}
      {/*    }*/}
      {/*    variant={'outlined'}*/}
      {/*  />*/}
      {/*</div>*/}

      <div
        style={{
          padding: '8px',
          display: 'flex',
          gap: '8px',
          flexDirection: 'column',
          maxWidth: '328px'
        }}
      >
        <Input
          variant={'standard'}
          label={'Label'}
          error
          hint={<Typography variant={'caption2'}>Hint</Typography>}
        />
        <Input
          hint={<Typography variant={'caption2'}>Hint</Typography>}
          endAdornment={
            <Button variant={'ghost'} icon>
              <Icon name={'eye-open'} />
            </Button>
          }
          variant={'standard'}
          label={'Label'}
        />
      </div>

      {/*  switch  */}
      <div style={{ padding: '8px' }}>
        <Switch />
      </div>

      {/*  checkbox  */}
      <div>
        <Checkbox />
        <label htmlFor="defaultRule">Checkbox</label>
      </div>

      {/*  radio group  */}
      <RadioGroup>
        <div>
          <label htmlFor="defaultRule">Default</label>
          <Radio value={'One'} id="defaultRule" name="royaltyRule" />
        </div>
        <div>
          <label htmlFor="manualRule">Manual</label>
          <Radio value={'Two'} id="manualRule" name="royaltyRule" />
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
          startIcon={'social-google'}
          variant={'outlined'}
        >
          Google
        </Button>
        <Button
          style={{ width: '216px' }}
          startIcon={'social-apple'}
          variant={'outlined'}
        >
          Apple
        </Button>
      </div>
    </>
  );
}
