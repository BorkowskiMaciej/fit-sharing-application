import {Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../provider/authProvider";

export const ProtectedRoute = () => {
    const { tokenData } = useAuth();

    if (!tokenData) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};