import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const STORAGE_KEY = 'rubygym_auth';
const DEMO_USERS_KEY = 'rubygym_demo_users';
const AuthContext = createContext(null);
const backendCredentialAliases = {
  'trainer@rubygym.com': 'trainer.linh@rubygym.com',
  'member@rubygym.com': 'member.an@rubygym.com'
};
const seededBackendCredentials = {
  'admin@rubygym.com': { email: 'admin@rubygym.com', password: 'admin123' },
  'trainer@rubygym.com': { email: 'trainer.linh@rubygym.com', password: 'trainer123' },
  'trainer.linh@rubygym.com': { email: 'trainer.linh@rubygym.com', password: 'trainer123' },
  'member@rubygym.com': { email: 'member.an@rubygym.com', password: 'member123' },
  'member.an@rubygym.com': { email: 'member.an@rubygym.com', password: 'member123' }
};
const defaultDemoUsers = [
  {
    id: 1,
    email: 'admin@rubygym.com',
    password: 'admin123',
    role: 'ADMIN',
    full_name: 'RubyGYM Admin'
  },
  {
    id: 2,
    email: 'trainer.linh@rubygym.com',
    password: 'trainer123',
    role: 'TRAINER',
    full_name: 'Tran Thu Linh',
    trainer_id: 1
  },
  {
    id: 5,
    email: 'member.an@rubygym.com',
    password: 'member123',
    role: 'MEMBER',
    full_name: 'Nguyen Hoang An',
    member_id: 1,
    trainer_id: 1,
    current_weight: 68.5,
    height_cm: 172,
    current_bmi: 23.15,
    trainer_name: 'Tran Thu Linh',
    trainer_email: 'trainer.linh@rubygym.com',
    trainer_phone: '0901000002',
    referral_code: 'RUBY-1',
    onboarding_completed: true
  }
];

const normalizeLoginCredentials = (credentials) => {
  const email = String(credentials.email || '').trim();
  return {
    ...credentials,
    email: backendCredentialAliases[email.toLowerCase()] || email
  };
};

const shouldUseDemoFallback = (error) => !error?.response || error.response.status >= 500;

const calculateBmi = (weight, heightCm) => {
  const numericWeight = Number(weight);
  const numericHeight = Number(heightCm);

  if (!numericWeight || !numericHeight) {
    return null;
  }

  const heightInMeters = numericHeight / 100;
  return Number((numericWeight / (heightInMeters * heightInMeters)).toFixed(2));
};

const buildError = (message) => {
  const error = new Error(message);
  error.response = { data: { error: message } };
  return error;
};

const getStoredAuth = () => {
  const rawAuth = localStorage.getItem(STORAGE_KEY);

  if (!rawAuth) {
    return { token: null, user: null };
  }

  try {
    return JSON.parse(rawAuth);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
    return { token: null, user: null };
  }
};

const getDemoUsers = () => {
  const rawUsers = localStorage.getItem(DEMO_USERS_KEY);

  if (!rawUsers) {
    return defaultDemoUsers;
  }

  try {
    const parsedUsers = JSON.parse(rawUsers);
    return [...defaultDemoUsers, ...parsedUsers];
  } catch (error) {
    localStorage.removeItem(DEMO_USERS_KEY);
    return defaultDemoUsers;
  }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);

  const refreshProfile = useCallback(async () => {
    if (!auth.token || String(auth.token).startsWith('demo-token-')) {
      return auth.user;
    }

    const { data } = await api.get('/auth/me');
    const nextAuth = { token: auth.token, user: data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    return data;
  }, [auth.token, auth.user]);

  useEffect(() => {
    const syncAuthProfile = async () => {
      if (!auth.token) {
        return;
      }

      if (String(auth.token).startsWith('demo-token-')) {
        const migrationCredentials = seededBackendCredentials[auth.user?.email?.toLowerCase()];
        if (!migrationCredentials) {
          return;
        }

        try {
          const { data } = await api.post('/auth/login', migrationCredentials);
          const nextAuth = { token: data.token, user: data.user };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
          setAuth(nextAuth);
        } catch (error) {
          // Keep demo auth only when the backend cannot issue a real token.
        }

        return;
      }

      try {
        const { data } = await api.get('/auth/me');
        const nextAuth = { token: auth.token, user: data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
        setAuth(nextAuth);
      } catch (error) {
        // Keep current auth payload if profile refresh fails.
      }
    };

    syncAuthProfile();
  }, [auth.token, auth.user?.email]);

  const login = async (credentials) => {
    const backendCredentials = normalizeLoginCredentials(credentials);

    try {
      const { data } = await api.post('/auth/login', backendCredentials);
      const nextAuth = { token: data.token, user: data.user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
      return data.user;
    } catch (error) {
      if (!shouldUseDemoFallback(error)) {
        const errorMessage = error.response?.data?.error === 'Invalid credentials'
          ? 'Email hoặc mật khẩu không đúng.'
          : error.response?.data?.error || 'Không đăng nhập được.';
        throw buildError(errorMessage);
      }

      const matchedUser = getDemoUsers().find(
        (user) => user.email.toLowerCase() === backendCredentials.email.toLowerCase() && user.password === credentials.password
      );

      if (!matchedUser) {
        throw buildError('Email hoặc mật khẩu không đúng.');
      }

      const nextAuth = {
        token: `demo-token-${matchedUser.role.toLowerCase()}`,
        user: {
          id: matchedUser.id,
          email: matchedUser.email,
          role: matchedUser.role,
          full_name: matchedUser.full_name,
          trainer_id: matchedUser.trainer_id,
          member_id: matchedUser.member_id,
          current_weight: matchedUser.current_weight,
          height_cm: matchedUser.height_cm,
          current_bmi: matchedUser.current_bmi,
          trainer_name: matchedUser.trainer_name,
          trainer_email: matchedUser.trainer_email,
          trainer_phone: matchedUser.trainer_phone,
          referral_code: matchedUser.referral_code,
          onboarding_completed: matchedUser.onboarding_completed
        }
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
      return nextAuth.user;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post('/auth/register', payload);
      return data;
    } catch (error) {
      const demoUsers = getDemoUsers();
      const emailExists = demoUsers.some((user) => user.email.toLowerCase() === payload.email.toLowerCase());

      if (emailExists) {
        throw buildError('Email đã tồn tại trong hệ thống.');
      }

      const generatedId = Date.now();
      const newUser = {
        id: generatedId,
        email: payload.email,
        password: payload.password,
        role: 'MEMBER',
        full_name: payload.full_name,
        current_weight: payload.current_weight ? Number(payload.current_weight) : null,
        height_cm: payload.height_cm ? Number(payload.height_cm) : null,
        current_bmi: calculateBmi(payload.current_weight, payload.height_cm),
        trainer_id: payload.trainer_id ? Number(payload.trainer_id) : null,
        member_id: generatedId,
        referral_code: `RUBY-${generatedId}`,
        onboarding_completed: false
      };

      const customUsers = demoUsers.filter(
        (user) => !defaultDemoUsers.some((defaultUser) => defaultUser.email === user.email)
      );
      localStorage.setItem(DEMO_USERS_KEY, JSON.stringify([...customUsers, newUser]));

      return {
        message: 'Đăng ký thành công.',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          full_name: newUser.full_name,
          current_weight: newUser.current_weight,
          height_cm: newUser.height_cm,
          current_bmi: newUser.current_bmi,
          onboarding_completed: false
        }
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth({ token: null, user: null });
  };

  const value = useMemo(() => ({
    token: auth.token,
    user: auth.user,
    isAuthenticated: Boolean(auth.token),
    login,
    register,
    refreshProfile,
    logout
  }), [auth, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
