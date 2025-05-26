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

type AuthContextType = {
  user: any;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Tambahan: tunggu sampai data dari localStorage dicek
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // ✅ Sinkronisasi ke Redux
      dispatch(
        setReduxUser({
          username: parsedUser.username,
          nama: parsedUser.nama,
          user_group_id: parsedUser.user_group_id,
        })
      );
    }
    setIsLoading(false); // ✅ Selesai inisialisasi user
  }, [dispatch]);

  const login = async (username: string, password: string) => {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !userData) {
      alert('❌ Username tidak ditemukan');
      return false;
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) {
      alert('❌ Password salah');
      return false;
    }

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    dispatch(
      setReduxUser({
        username: userData.username,
        nama: userData.nama,
        user_group_id: userData.user_group_id,
      })
    );

    return true;
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
