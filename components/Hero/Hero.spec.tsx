import { render } from '@testing-library/react';
import { Hero } from './Hero';

describe('Hero', () => {
  it('Should render component', () => {
    const { container } = render(<Hero key="" />);

    expect(container).toMatchSnapshot();
  });
});
