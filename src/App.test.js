import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the tournament title and stat headline', () => {
  render(<App />);
  expect(screen.getByText(/FIXTURES/i)).toBeInTheDocument();
  expect(screen.getByText('104')).toBeInTheDocument();
});

test('renders the opening match', () => {
  render(<App />);
  expect(screen.getAllByText('Mexico').length).toBeGreaterThan(0);
  expect(screen.getAllByText('South Africa').length).toBeGreaterThan(0);
});
