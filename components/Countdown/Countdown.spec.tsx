import { render } from '@testing-library/react';
import { Countdown } from './Countdown';

describe('Countdown', () => {
  it('Should render component', () => {
    const { container } = render(
      <Countdown endBlock={1} typography="h1" orientation="horizontal" />
    );

    expect(container).toMatchSnapshot();
  });
});
