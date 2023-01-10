import { render } from '@testing-library/react';
import { ConnectWallet } from './ConnectWallet';

describe('Account', () => {
  it('Should render component', () => {
    const { container } = render(<ConnectWallet key="" />);

    expect(container).toMatchSnapshot();
  });
});
