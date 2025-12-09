import { Navigate } from "react-router";
// import { getToken } from 'utils/utils';

const PrivateRoute = ({ component: Component }) => {
  return (
    // getToken() ? <Component /> : <Navigate to="/login"/>

    // true ? <Component /> : <Navigate to="/login" />
    true ? <Component /> : <Navigate to="/" />
  );
};

export default PrivateRoute;
