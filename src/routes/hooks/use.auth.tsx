// types/auth.ts
export interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session {
  user?: User;
}

import __helpers from '@/helpers';
// hooks/use-auth.ts
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const useAuth = () => {
  const infoUser = useSelector((state: RootState) => state.auth.infoUser);

  const signOut = () => {
    localStorage.removeItem('user');
  };

  return {
    data: infoUser || null,
    signOut
  };
};
