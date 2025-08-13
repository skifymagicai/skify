import { render, screen } from '@testing-library/react';
import Home from '../../src/pages/Home';

test('renders Get Started button', () => {
  render(<Home />);
  expect(screen.getByTestId('button-get-started')).toBeInTheDocument();
});
