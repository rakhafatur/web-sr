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

/** `invalid` sengaja menggabungkan "username tidak ada" dan "password salah" —
    membedakan keduanya membocorkan username mana yang terdaftar. */
type LoginResult = 'success' | 'inactive' | 'invalid' | 'error';

/** Identitas user yang sedang login. Sengaja TIDAK memuat `password` —
    hash tidak boleh ikut tersimpan di state maupun localStorage. */
export type AuthUser = {
  id: string;
  username: string;
  nama: string | null;
  is_active: boolean;
  user_group_id: string | null;
  ladies_id: string | null;
  pengawas_id: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser) as AuthUser & { password?: string };

      // Sesi lama (dibuat sebelum perbaikan ini) masih menyimpan hash —
      // bersihkan begitu dibaca supaya tidak mengendap terus di browser.
      if (parsedUser.password) {
        delete parsedUser.password;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }

      setUser(parsedUser);
      dispatch(
        setReduxUser({
          id: parsedUser.id,
          username: parsedUser.username,
          nama: parsedUser.nama,
          user_group_id: parsedUser.user_group_id,
          ladies_id: parsedUser.ladies_id,
          pengawas_id: parsedUser.pengawas_id,
        })
      );
    }
    setIsLoading(false);
  }, [dispatch]);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, username, nama, password, is_active, user_group_id, ladies_id, pengawas_id')
      .eq('username', username.trim())
      .single();

    if (error || !userData) return 'invalid';

    const passwordMatch = await bcrypt.compare(password, userData.password);
    if (!passwordMatch) return 'invalid';

    if (!userData.is_active) return 'inactive';

    // Bentuk ulang secara eksplisit tanpa `password` — tanpa ini hash ikut
    // mengendap di localStorage dan bisa dibaca script mana pun di halaman.
    const authUser: AuthUser = {
      id: userData.id,
      username: userData.username,
      nama: userData.nama,
      is_active: userData.is_active,
      user_group_id: userData.user_group_id,
      ladies_id: userData.ladies_id,
      pengawas_id: userData.pengawas_id,
    };

    setUser(authUser);
    localStorage.setItem('user', JSON.stringify(authUser));
    dispatch(
      setReduxUser({
        id: authUser.id,
        username: authUser.username,
        nama: authUser.nama,
        user_group_id: authUser.user_group_id,
        ladies_id: authUser.ladies_id,
        pengawas_id: authUser.pengawas_id,
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