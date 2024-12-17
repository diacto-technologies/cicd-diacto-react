import { useContext, useEffect } from "react";
import { Route, Navigate, Outlet,Redirect, useLocation } from "react-router-dom";
import AuthContext from "../context/AuthContext";


const PrivateRoute = () => {
    const { user, loadingDetails } = useContext(AuthContext);
  
    // If still loading user details, render nothing (or a loading spinner)
    if (loadingDetails) {
      return <div className="h-screen w-full flex items-center justify-center"><label>Loading...</label></div>; // You can replace this with a proper loading spinner if desired
    }
  
    // If not loading and the user is authenticated, render the protected route
    return user ? <Outlet /> : <Navigate to="/app/login/" />;
  };
  
  export default PrivateRoute;