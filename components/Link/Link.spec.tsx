import { render } from '@testing-library/react';
import { Link } from './Link';

describe('Link', () => {
  it('Should render component', () => {
    const { container } = render(<Link href="https://sctl.xyz" />);

    expect(container).toMatchSnapshot();
  });
});
