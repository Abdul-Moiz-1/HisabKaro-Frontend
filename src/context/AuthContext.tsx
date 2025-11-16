// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role, Permission } from '../types/rbac.types';
import { getRolePermissions } from '../config/rbac.config';

const AUTH_STORAGE_KEY = '@app_auth_user';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        // Refresh permissions based on role
        parsedUser.permissions = getRolePermissions(parsedUser.role);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('YOUR_API_URL/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const userData: User = await response.json();

      // Ensure permissions are set based on role
      userData.permissions = getRolePermissions(userData.role);

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      // Refresh permissions based on role
      updatedUser.permissions = getRolePermissions(updatedUser.role);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const hasPermission = (permission: Permission | Permission[]): boolean => {
    if (!user || !user.isActive) return false;

    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.every(p => user.permissions.includes(p));
  };

  const hasRole = (role: Role | Role[]): boolean => {
    if (!user || !user.isActive) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
