import { render } from '@testing-library/react';
import { Queue } from './Queue';

describe('Queue', () => {
  it('Should render component', () => {
    const { container } = render(<Queue />);

    expect(container).toMatchSnapshot();
  });
});
