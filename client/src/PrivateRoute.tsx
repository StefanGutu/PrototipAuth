import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthUse';

//Function that give access to the protected page if the user is authenticated
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const {token} = useAuth() ;

  const isAuthenticated = Boolean(token);

  if(isAuthenticated){
    return children;
  }else{
    return <Navigate to="/" />
  }
};

export default PrivateRoute;
