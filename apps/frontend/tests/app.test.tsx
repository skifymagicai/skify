import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders SkifyMagicAI home', () => {
  render(<App />);
  expect(screen.getByText('SkifyMagicAI')).toBeInTheDocument();
});
