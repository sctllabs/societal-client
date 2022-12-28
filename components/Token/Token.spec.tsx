import { render } from '@testing-library/react';
import { Token } from './Token';

describe('Token', () => {
  it('Should render component', () => {
    const { container } = render(<Token daoId="" />);

    expect(container).toMatchSnapshot();
  });
});
