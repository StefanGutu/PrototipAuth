import { Navigate } from 'react-router-dom';

//Function that give access to the protected page if the user is authenticated
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = !!localStorage.getItem('authToken'); 

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
