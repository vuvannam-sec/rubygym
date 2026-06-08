import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders RubyGYM landing page', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );

  expect(screen.getByRole('heading', { name: /Mạnh mẽ hơn mỗi ngày/i })).toBeInTheDocument();
  // Real-gym sections are present (Task 6 redesign).
  expect(screen.getByRole('heading', { name: /Chọn gói phù hợp với bạn/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Lớp tập cho mọi mục tiêu/i })).toBeInTheDocument();
});
