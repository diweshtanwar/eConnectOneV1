import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authApi, type UserResponseDto } from '../api/api'; // Updated import
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: UserResponseDto | null; // Updated type
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserResponseDto | null>(null); // Updated type
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<{ nameid: string; role: string; unique_name: string }>(token);
        setUser({
          id: parseInt(decoded.nameid),
          username: decoded.unique_name,
          roleName: decoded.role, // Updated property name
          isActive: true,
          createdAt: new Date().toISOString(), // Added default for now
          isDeleted: false, // Added
        });
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { token } = await authApi.login({ username, password });
      localStorage.setItem('token', token);
      const decoded = jwtDecode<{ nameid: string; role: string; unique_name: string }>(token);
      setUser({
        id: parseInt(decoded.nameid),
        username: decoded.unique_name,
        roleName: decoded.role, // Updated property name
        isActive: true,
        createdAt: new Date().toISOString(), // Added default for now
        isDeleted: false, // Added
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
