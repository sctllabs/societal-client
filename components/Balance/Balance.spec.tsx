import { render } from '@testing-library/react';
import { Balance } from './Balance';

describe('Balance', () => {
  it('Should render component', () => {
    const { container } = render(<Balance />);

    expect(container).toMatchSnapshot();
  });
});
