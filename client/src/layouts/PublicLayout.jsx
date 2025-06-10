import { Navigate, Outlet } from 'react-router-dom';

import { RoutePaths } from '@/routes';
import { EAuthToken } from '../variables/common';

const PublicLayout = () => {
  const isAuth = localStorage.getItem(EAuthToken.ACCESS_TOKEN);

  return isAuth ? <Navigate to={RoutePaths.HOME} /> : <Outlet />;
};

export default PublicLayout;
