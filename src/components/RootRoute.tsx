import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../app/store';

const RootRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((state: RootState) => state.user.currentUser);

  if (user?.ladies_id) {
    return <Navigate to="/ladies/home" replace />;
  }

  return <>{children}</>;
};

export default RootRoute;
