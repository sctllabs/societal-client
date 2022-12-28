import { render } from '@testing-library/react';
import { Account } from './Account';

describe('Account', () => {
  it('Should render component', () => {
    const { container } = render(<Account key="" />);

    expect(container).toMatchSnapshot();
  });
});
