import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MemberOnboarding from './MemberOnboarding';

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() =>
      Promise.resolve({
        data: {
          completed: false,
          missing_steps: ['PROFILE_METRICS', 'SUBSCRIPTION'],
          member: { current_weight: null, height_cm: null, trainer_id: null },
          subscription: null,
          trainers: []
        }
      })
    ),
    put: jest.fn()
  }
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { current_weight: null, height_cm: null }, refreshProfile: jest.fn() })
}));

describe('MemberOnboarding (ADR-002: no duplicate goal entry)', () => {
  test('renders body metrics and plan, but no training-goal inputs', async () => {
    render(
      <MemoryRouter>
        <MemberOnboarding />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('Hoàn tất hồ sơ hội viên')).toBeInTheDocument());

    // Onboarding scope: body metrics + plan + trainer.
    expect(screen.getByText('Chỉ số cơ thể')).toBeInTheDocument();
    expect(screen.getByText('Cân nặng hiện tại (kg)')).toBeInTheDocument();
    expect(screen.getByText('Gói tập và HLV')).toBeInTheDocument();

    // The training goal must NOT be entered here anymore.
    expect(screen.queryByText('Nhóm mục tiêu')).not.toBeInTheDocument();
    expect(screen.queryByText('Cân nặng mục tiêu (kg)')).not.toBeInTheDocument();
    expect(screen.queryByText('BMI mục tiêu')).not.toBeInTheDocument();

    // But it points the member to the dedicated Goals page.
    expect(screen.getByText('Tới trang Mục tiêu')).toBeInTheDocument();
  });
});
