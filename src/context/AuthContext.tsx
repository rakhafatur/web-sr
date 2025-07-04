import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { useDispatch } from 'react-redux';
import {
  setUser as setReduxUser,
  clearUser as clearReduxUser,
} from '../features/user/userSlice';

type LoginResult = 'success' | 'inactive' | 'wrong_password' | 'not_found' | 'error';

type AuthContextType = {
  user: any;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      dispatch(
        setReduxUser({
          username: parsedUser.username,
          nama: parsedUser.nama,
          user_group_id: parsedUser.user_group_id,
          ladies_id: parsedUser.ladies_id,
          nama_ladies: parsedUser.nama_ladies,
        })
      );
    }
    setIsLoading(false);
  }, [dispatch]);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.trim())
      .single();

    if (error || !userData) return 'not_found';

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) return 'wrong_password';

    if (!userData.is_active) return 'inactive';

    // Simpan ke local state + Redux + localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch(
      setReduxUser({
        username: userData.username,
        nama: userData.nama,
        user_group_id: userData.user_group_id,
        ladies_id: userData.ladies_id,
        nama_ladies: userData.nama_ladies,
      })
    );

    return 'success';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    dispatch(clearReduxUser());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {isLoading ? <div className="text-light text-center mt-4">⏳ Memuat sesi login...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};