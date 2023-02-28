import { render } from '@testing-library/react';
import { SidebarLink } from './SidebarLink';

describe('SidebarLink', () => {
  it('Should render component', () => {
    const { container } = render(<SidebarLink href="https://sctl.xyz" />);

    expect(container).toMatchSnapshot();
  });
});
