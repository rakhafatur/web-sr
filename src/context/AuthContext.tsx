import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabaseClient';
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

  /**
   * Verifikasi password dikerjakan Edge Function `login` di server, bukan di
   * browser — hash bcrypt tidak pernah dikirim ke klien. Bentuk sesi yang
   * disimpan tetap sama seperti sebelumnya, jadi user yang sudah login tidak
   * perlu login ulang saat perubahan ini dirilis.
   */
  const login = async (username: string, password: string): Promise<LoginResult> => {
    const { data, error } = await supabase.functions.invoke<{
      result: LoginResult;
      user?: AuthUser;
    }>('login', {
      body: { username: username.trim(), password },
    });

    if (error || !data) return 'error';

    if (data.result !== 'success' || !data.user) return data.result;

    const authUser = data.user;

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