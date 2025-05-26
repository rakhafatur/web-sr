import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabaseClient';

export type User = {
  id?: string;
  username: string;
  nama: string | null;
  user_group_id?: string | null;
};

type UserState = {
  data: User[];
  page: number;
  limit: number;
  total: number;
  loading: boolean;
  error: string | null;
  currentUser: User | null;
};

const initialState: UserState = {
  data: [],
  page: 1,
  limit: 10,
  total: 0,
  loading: false,
  error: null,
  currentUser: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetch',
  async ({ page, limit }: { page: number; limit: number }) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range(from, to);

    if (error) throw error;
    return { data, total: count || 0 };
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Gagal fetch user';
      });
  },
});

export const { setPage, setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
