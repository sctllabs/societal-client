import { render } from '@testing-library/react';
import { Search } from './Search';

describe('Search', () => {
  it('Should render component', () => {
    const { container } = render(<Search />);

    expect(container).toMatchSnapshot();
  });
});
