import { render } from '@testing-library/react';
import { About } from './About';

describe('About', () => {
  it('Should render component', () => {
    const { container } = render(<About />);

    expect(container).toMatchSnapshot();
  });
});
