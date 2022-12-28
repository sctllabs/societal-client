import { render } from '@testing-library/react';
import { Overview } from './Overview';

describe('Overview', () => {
  it('Should render component', () => {
    const { container } = render(<Overview />);

    expect(container).toMatchSnapshot();
  });
});
