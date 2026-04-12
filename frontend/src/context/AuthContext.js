import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const STORAGE_KEY = 'rubygym_auth';
const DEMO_USERS_KEY = 'rubygym_demo_users';
const AuthContext = createContext(null);
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
    email: 'trainer@rubygym.com',
    password: 'trainer123',
    role: 'TRAINER',
    full_name: 'Huấn luyện viên Demo',
    trainer_id: 2
  },
  {
    id: 3,
    email: 'member@rubygym.com',
    password: 'member123',
    role: 'MEMBER',
    full_name: 'Hội viên Demo',
    member_id: 3,
    trainer_id: 2,
    trainer_name: 'Huấn luyện viên Demo',
    trainer_email: 'trainer@rubygym.com',
    trainer_phone: '0900000000',
    referral_code: 'RUBY-3'
  }
];

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

  useEffect(() => {
    const syncAuthProfile = async () => {
      if (!auth.token || String(auth.token).startsWith('demo-token-')) {
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
  }, [auth.token]);

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      const nextAuth = { token: data.token, user: data.user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
      setAuth(nextAuth);
      return data.user;
    } catch (error) {
      const matchedUser = getDemoUsers().find(
        (user) => user.email.toLowerCase() === credentials.email.toLowerCase() && user.password === credentials.password
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
          trainer_name: matchedUser.trainer_name,
          trainer_email: matchedUser.trainer_email,
          trainer_phone: matchedUser.trainer_phone,
          referral_code: matchedUser.referral_code
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
        trainer_id: payload.trainer_id ? Number(payload.trainer_id) : null,
        member_id: generatedId,
        referral_code: `RUBY-${generatedId}`
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
          full_name: newUser.full_name
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
    logout
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
