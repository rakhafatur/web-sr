import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../app/store';
import { BERANDA, peranDari } from '../layout/peran';

/** '/' adalah Home admin — ladies & pengawas dialihkan ke Home masing-masing. */
const RootRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((state: RootState) => state.user.currentUser);
  const peran = peranDari(user);

  if (peran !== 'admin') {
    return <Navigate to={BERANDA[peran]} replace />;
  }

  return <>{children}</>;
};

export default RootRoute;
