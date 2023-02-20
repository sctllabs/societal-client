import { render } from '@testing-library/react';
import { Members } from './Members';

describe('Members', () => {
  it('Should render component', () => {
    const { container } = render(<Members daoId="" />);

    expect(container).toMatchSnapshot();
  });
});
