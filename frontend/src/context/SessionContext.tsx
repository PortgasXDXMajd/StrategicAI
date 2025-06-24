'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { LocalStorageHelper } from '@/utils/helpers/LocalStorageHelper';

interface SessionData {
  id: string;
  email: string;
  first_login: boolean;
  expiration: number;
}

interface SessionContextProps {
  session: SessionData | null;
  setSession: (sessionData: SessionData) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined
);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}: SessionProviderProps) => {
  const [session, setSessionState] = useState<SessionData | null>(null);

  useEffect(() => {
    const storedSession = LocalStorageHelper.getSession();
    if (storedSession) {
      setSessionState(storedSession);
    }
  }, []);

  // Wrap setSession to store session in localStorage
  const setSession = (sessionData: SessionData) => {
    setSessionState(sessionData);
    LocalStorageHelper.setSession(sessionData); // Store session in localStorage
  };

  const clearSession = () => {
    setSessionState(null);
    LocalStorageHelper.removeSession();
    LocalStorageHelper.removeAccessToken();
  };

  return (
    <SessionContext.Provider value={{ session, setSession, clearSession }}>
      {children}
    </SessionContext.Provider>
  );
};
