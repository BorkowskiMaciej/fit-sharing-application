import {RouterProvider, createBrowserRouter, Navigate} from "react-router-dom";
import { useAuth } from "../provider/authProvider";
import { ProtectedRoute } from "./ProtectedRoute";
import React from "react";
import Login from "../components/authentication/Login";
import Register from "../components/authentication/Register";
import ResetPassword from "../components/authentication/ResetPassword";
import RelationshipList from "../components/relationship/RelationshipList";
import NavBar from "../components/navigation/NavBar";
import UserList from "../components/user/UserList";
import ChangePassword from "../components/user/ChangePassword";
import EditProfile from "../components/user/EditProfile";
import MyProfile from "../components/user/MyProfile";
import FriendProfile from "../components/user/FriendProfile";
import {MainComponent} from "../components/MainComponent";

const Routes = () => {
    const { tokenData, setTokenData } = useAuth();

    const routesForAuthenticatedOnly = [
        {
            path: "/",
            element: (
                <>
                    <NavBar />
                    <div className="main-content">
                        <ProtectedRoute />
                    </div>
                </>
                ),
            children: [
                {
                    path: "/",
                    element: <MainComponent />,
                },
                {
                    path: "/user/:uuid",
                    element: <FriendProfile />,
                },
                {
                    path: "/me",
                    element: <MyProfile />,
                },
                {
                    path: "/me/edit",
                    element: <EditProfile setTokenData={setTokenData} />,
                },
                {
                    path: "/me/change-password",
                    element: <ChangePassword />,
                },
                {
                    path: "/search/:query",
                    element: <UserList />,
                },
                {
                    path: "/relationships",
                    element: <RelationshipList />,
                },
                {
                    path: "*",
                    element: <Navigate to="/" />,
                },
            ],
        },
    ];

    const routesForNotAuthenticatedOnly = [
        {
            path: "*",
            element: <Navigate to="/login" replace />,
        },
        {
            path: "/login",
            element: <Login setToken={setTokenData} />,
        },
        {
            path: "/register",
            element: <Register />,
        },
        {
            path: "/reset-password",
            element: <ResetPassword />,
        },
    ];

    const router = createBrowserRouter([
        ...(!tokenData ? routesForNotAuthenticatedOnly : []),
        ...routesForAuthenticatedOnly,
    ]);

    return <RouterProvider router={router} />;
};

export default Routes;