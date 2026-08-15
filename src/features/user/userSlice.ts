import { createSlice } from '@reduxjs/toolkit';

export type User = {
  id?: string;
  username: string;
  nama: string | null;
  user_group_id?: string | null;
  ladies_id?: string | null;
};

/**
 * Redux di app ini HANYA menyimpan sesi user yang sedang login.
 * Semua data server lain (list, detail, transaksi) diambil lewat React Query —
 * jangan tambah thunk fetch data di sini supaya tidak ada dua sumber kebenaran.
 */
type UserState = {
  currentUser: User | null;
};

const initialState: UserState = {
  currentUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;